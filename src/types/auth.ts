export interface User {
  id?: string;
  name: string;
  mobile: string;
  email?: string;
  isAdmin?: boolean;
}

export interface LoginPayload {
  name: string;
  mobile: string;
  /** Required when signing in with the admin mobile */
  adminPassword?: string;
}
