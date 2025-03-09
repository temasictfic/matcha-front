export interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
    last_login: string | null;
    is_online: boolean;
    last_online: string | null;
  }
  
  export interface UserLogin {
    username: string;
    password: string;
  }
  
  export interface UserRegister {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }
  
  export interface TokenResponse {
    access_token: string;
    token_type: string;
  }
  
  export interface PasswordChange {
    current_password: string;
    new_password: string;
  }
  
  export interface PasswordReset {
    token: string;
    new_password: string;
  }