export interface User {
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
}
