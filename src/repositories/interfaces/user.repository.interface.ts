export interface AppUser {
  id: string
  email: string
  passwordHash: string
}

export interface IUserRepository {
  findByEmail(email: string): Promise<AppUser | null>
}
