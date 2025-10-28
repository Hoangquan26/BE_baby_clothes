export interface CreateUserDTO {
  email: string;
  username: string;
  passwordHash: string;
  fullName?: string | null;
}
