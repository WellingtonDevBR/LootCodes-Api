export function maskEmail(email: string | null | undefined): string {
  if (!email) return '[none]';
  const atIdx = email.indexOf('@');
  if (atIdx < 1) return '***';

  const local = email.slice(0, atIdx);
  const domain = email.slice(atIdx + 1);
  const dotIdx = domain.lastIndexOf('.');

  const maskedLocal = local.length <= 2
    ? local[0] + '***'
    : local.slice(0, 2) + '***';

  if (dotIdx < 1) return `${maskedLocal}@***`;

  const domainName = domain.slice(0, dotIdx);
  const tld = domain.slice(dotIdx);
  const maskedDomain = domainName.length <= 2
    ? domainName[0] + '***'
    : domainName.slice(0, 2) + '***';

  return `${maskedLocal}@${maskedDomain}${tld}`;
}
