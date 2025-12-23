export interface LoginRequest {
    login: string;
    password: string;
}
export interface SignUpRequest {
    username: string;
    email: string;
    password: string;
    admin: number;
    googleId: string | null;
}