# Run the API on EC2 (Docker + ECR + GitHub Actions)

This walks you from zero to a working API on EC2 at `**http://YOUR_PUBLIC_IP:3000**` (health check: `/health`), or **`https://api.example.com`** when you enable the optional ALB in Terraform.

**Port 3000:** The app and Docker **both** use **3000** (see `PORT` default in `src/config/env.ts`, `docker-compose.prod.yml`, and `Dockerfile`). Without an ALB, the security group opens **3000** to your allowed CIDRs. With **`enable_https_alb = true`**, **3000** is open **only** to the ALB security group; clients use **HTTPS on 443** (HTTP on 80 returns **301** to HTTPS).

---

## What you need

- AWS account and permission to create EC2, ECR, IAM roles, and (optionally) OIDC.
- GitHub repo with this backend and the workflow `.github/workflows/backend-ci-cd.yml`.
- Production values for every variable in `src/config/env.ts` (use `.env.example` as a checklist).

---

## Provision EC2 with Terraform (recommended — secure defaults)

Terraform in **`backend/deploy/terraform`** creates a **dedicated** API instance so you are not hand-patching an old box.

**What it manages**

- **Amazon Linux 2023** + **user-data** bootstrap: Docker, Compose plugin, `awscli`, deploy directory.
- **IAM instance profile**: SSM (`AmazonSSMManagedInstanceCore`) + **ECR pull** for your repository (no blanket admin).
- **EC2 key pair**: **`ec2_key_pair_name`** defaults to **`Eneba`** (use with your existing **`Eneba.pem`** — the `.pem` stays local; Terraform only references the key name already registered under **EC2 → Key pairs**).  
- **Security group**: **HTTPS egress**; **port 3000** from `api_ingress_cidr_blocks` when **`enable_https_alb`** is false, or **only from the ALB** when **`enable_https_alb`** is true. **No SSH** on port 22 unless you set `ssh_ingress_cidr_blocks` (SSM still works without SSH).
- **Optional ALB** (`enable_https_alb`): ACM certificate (DNS validation in Route53), internet-facing ALB in **two** public AZs, **443** forwards to the instance **:3000**, **80** **301** redirects to **HTTPS**. Optional **Route53 alias** `api_fqdn` to the ALB. Requires **`api_fqdn`**, **`route53_zone_id`**, and a VPC with at least **two** `map_public_ip_on_launch` subnets in different AZs (see `checks.tf`).
- **Hardening**: **IMDSv2 required**, **encrypted gp3** root volume, **detailed monitoring** on.

**Greenfield (new server)**

```bash
cd backend/deploy/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars — set api_ingress_cidr_blocks to your IP (/32 from https://checkip.amazonaws.com )
terraform init
terraform plan
terraform apply
```

Copy **`instance_id`** from outputs into GitHub variable **`EC2_INSTANCE_IDS`**. Set **`EC2_DEPLOY_DIR`** to the same value as `deploy_directory` (default `/opt/lootcodes-api`).

Then copy **`docker-compose.prod.yml`** and production **`.env`** onto the instance (Session Manager or `scp`), and run your GitHub deploy workflow.

**“If the instance already exists”**

Terraform does **not** auto-attach to a random running instance. Safer options:

1. **Create a new instance with Terraform** and migrate traffic; retire the old one, **or**
2. **Advanced:** `terraform import aws_instance.api i-xxxxxxxx` then align the config (AMI, subnet, security group, IAM profile) with what is in state or replace those resources in AWS — easy to get wrong; prefer (1).

**Overlap with manually created IAM**

If you already created **`EC2LootcodesApiInstance`** in IAM by hand, the Terraform stack creates **its own** role and profile (`name_prefix`). Remove the unused manual profile from unused instances, or delete the old Terraform-less role to avoid confusion.

---

## Step 1 — Create an ECR repository

1. AWS Console → **Elastic Container Registry** → **Repositories** → **Create repository**.
2. Name it (e.g. `lootcodes-api`), private, leave defaults → **Create**.
3. Note **URI** / **Repository name** and your **Region** (e.g. `us-east-1`).

CLI equivalent:

```bash
aws ecr create-repository --repository-name lootcodes-api --region us-east-1
```

---

## Step 2 — GitHub OIDC provider in IAM (once per AWS account)

If you do not already have `token.actions.githubusercontent.com`:

1. IAM → **Identity providers** → **Add provider** → **OpenID Connect**.
2. Provider URL: `https://token.actions.githubusercontent.com`
3. Audience: `sts.amazonaws.com`
4. **Add provider**

---

## Step 3 — IAM role for GitHub Actions (push + SSM deploy)

1. IAM → **Roles** → **Create role** → **Web identity**.
2. Provider: `token.actions.githubusercontent.com`, Audience: `sts.amazonaws.com`.
3. **GitHub** organization + **repository** → narrow permission with a custom trust policy (recommended):
  - Copy `deploy/iam-trust-policy.github.example.json`.
  - Replace `ACCOUNT_ID`, `GITHUB_ORG`, `GITHUB_REPO`.
  - Tighten `sub` from `repo:ORG/REPO:*` to only `main` when you are ready (see file comments in the workflow YAML).
4. Attach an **inline policy** based on `deploy/github-actions-deploy-role-policy.example.json`:
  - Replace `REGION`, `ACCOUNT_ID`, `ECR_REPOSITORY_NAME` with real values.
5. Name the role (e.g. `github-actions-lootcodes-api-deploy`) → **Create role**.
6. Copy the role **ARN** — this goes in GitHub as secret `**AWS_ROLE_ARN`**.

---

## Step 4 — IAM role for the EC2 instance (SSM + ECR pull)

1. IAM → **Roles** → **Create role** → **AWS service** → **EC2**.
2. Attach managed policy `**AmazonSSMManagedInstanceCore`** (Session Manager, no SSH required).
3. Add an **inline policy** from `deploy/ec2-instance-profile-policy.example.json` (ECR pull).
4. Name (e.g. `ec2-lootcodes-api`) → **Create role**.

You will choose this role as the **instance profile** when launching EC2.

---

## Step 5 — Launch EC2

1. **AMI**: Amazon Linux 2023 (or Ubuntu 22.04; the bootstrap script supports both).
2. **Instance type**: e.g. `t3.small` or larger.
3. **Key pair**: optional if you use only SSM Session Manager.
4. **Network**: VPC + public subnet if you want a public IPv4 for `:3000`.
5. **Security group** inbound rules:
  - **SSH (22)** — only your IP, or skip if using SSM only.
  - **Custom TCP 3000** — your IP for testing, or `0.0.0.0/0` if this is the only front door (better: put an ALB + HTTPS later).
6. **Advanced** → **IAM instance profile**: select the EC2 role from Step 4.
7. **Storage**: 20 GB gp3 is usually enough.
8. Launch.

Wait until **Instance state** = running and **Status checks** pass. Note **Public IPv4** (or use a static Elastic IP later).

---

## Step 6 — Install Docker on the instance (one time)

Connect with **Session Manager** (EC2 → **Connect** → **Session Manager**) or SSH.

From your laptop you can copy the bootstrap script, or paste commands manually.

**Option A — run the repo script**

```bash
# On the instance, after copying bootstrap-ec2.sh:
sudo bash deploy/bootstrap-ec2.sh
```

**Option B — Amazon Linux 2023 minimal**

```bash
sudo dnf install -y docker docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker ssm-user   # or ec2-user, depending on AMI
sudo mkdir -p /opt/lootcodes-api
sudo chmod 700 /opt/lootcodes-api
```

Log out and back in (or start a new SSM session) so `docker` group applies if you run compose as non-root.

---

## Step 7 — Deploy directory and compose file on EC2

Create the directory GitHub Actions will `cd` into (default `**/opt/lootcodes-api**`):

```bash
sudo mkdir -p /opt/lootcodes-api
sudo chown "$USER:$USER" /opt/lootcodes-api
```

Copy `**docker-compose.prod.yml**` from this repo into `/opt/lootcodes-api/`.

It must publish **3000** on the host (already set in repo):

```yaml
ports:
  - "3000:3000"
```

---

## Step 8 — Production `.env` on the server

1. On your machine, copy `.env.example` to a local file (e.g. `.env.production`) and fill all required keys for `**NODE_ENV=production**`.
2. **Do not commit** that file.
3. Upload to the instance (replace host and path):

```bash
scp -i your-key.pem .env.production ec2-user@YOUR_PUBLIC_IP:/opt/lootcodes-api/.env
```

Or with SSM + base64, editor, etc. The path must be `**/opt/lootcodes-api/.env**` next to `docker-compose.prod.yml`.

**PORT in `.env`:** use `**PORT=3000**` (or omit for default). Host and container both expose **3000**.

---

## Step 9 — GitHub Actions configuration

The workflow lives at **`.github/workflows/backend-ci-cd.yml`** in this repository (**WellingtonDevBR/LootCodes-Api**). Ensure your IAM OIDC trust policy includes `repo:WellingtonDevBR/LootCodes-Api:*` (or a narrower `sub` claim).

In the GitHub repo: **Settings → Secrets and variables → Actions**.

**Secret**

| Name | Value |
| --- | --- |
| `AWS_ROLE_ARN` | Your IAM OIDC deploy role ARN (e.g. `arn:aws:iam::546820406679:role/GitHubActionsLootCodesApiDeploy` if created via AWS CLI in this guide) |


**Variables**


| Name               | Example               | Notes                                               |
| ------------------ | --------------------- | --------------------------------------------------- |
| `AWS_REGION`       | `us-east-1`           | Optional; workflow defaults to `us-east-1` if unset |
| `ECR_REPOSITORY`   | `lootcodes-api`       | Must match Step 1                                   |
| `EC2_INSTANCE_IDS` | `i-0123456789abcdef0` | Comma-separated for several instances               |
| `EC2_DEPLOY_DIR`   | `/opt/lootcodes-api`  | Optional if you use the default path                |


---

## Step 10 — First deployment

1. Merge to `**main`** (or **Actions → Backend CI / CD → Run workflow**).
2. Watch the **deploy** job: ECR push then **SSM** runs `docker compose pull` and `up -d`.
3. On the instance, verify:

```bash
cd /opt/lootcodes-api
docker compose -f docker-compose.prod.yml ps
curl -sS http://127.0.0.1:3000/health
```

From your laptop:

```bash
curl -sS http://YOUR_PUBLIC_IP:3000/health
```

You should see JSON with `"status":"ok"`.

---

## Troubleshooting


| Symptom                             | What to check                                                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Connection refused on `:3000`       | Security group allows inbound **3000**; container is `Up` (`docker compose ps`).                                                     |
| SSM command fails on `docker login` | Instance role has **ECR** permissions; region matches **ECR** and `AWS_DEFAULT_REGION` in the command.                               |
| SSM command fails on `cd`           | `EC2_DEPLOY_DIR` in GitHub matches path on server; `docker-compose.prod.yml` and `.env` exist there.                                 |
| 502 / app crashes                   | Logs: `docker compose -f docker-compose.prod.yml logs -f --tail=200 api` — fix missing/invalid `.env` vars (`loadEnv()` fails fast). |
| GitHub cannot assume role           | OIDC trust policy `sub` must include this repo/workflow (see Step 3).                                                                |


---

## Optional next steps

- Attach an **Application Load Balancer** + ACM certificate; target group **HTTP:3000** to the instance.
- Lock **port 3000** to the ALB security group only; remove `0.0.0.0/0`.
- Use **Elastic IP** so the public address does not change after stop/start.

