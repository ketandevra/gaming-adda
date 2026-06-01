export interface User {
  id?: string;
  name: string;
  mobile: string;
  email?: string;
}

export interface LoginPayload {
  name: string;
  mobile: string;
}
