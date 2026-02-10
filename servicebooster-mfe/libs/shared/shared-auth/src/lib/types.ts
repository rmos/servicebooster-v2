export interface SessionUser {
    id: number;
    userId: string;
    name: string;
    email: string;
    permissions: string[];
    exp: number;
  }