export interface LoginResponse {
    token: string;
    last_login_date: string;
    credential: string;
    id: number;
  }
  
  export interface JwtClaims {
    user_id: string;
    id: number;
    name: string;
    email: string;
    permissions: string[];
    iat: number;
    exp: number;
    [k: string]: unknown;
  }
  
  export interface SessionUser {
    id: number;
    userId: string;
    name: string;
    email: string;
    permissions: string[];
    exp: number;
  }