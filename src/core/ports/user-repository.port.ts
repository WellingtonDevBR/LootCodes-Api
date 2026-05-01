export interface IUserRepository {
  findIdByEmail(email: string): Promise<string | null>;
}
