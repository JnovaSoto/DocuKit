import 'express-session';
import { PrismaUser } from "@prisma/client";

declare module 'express-session' {
    interface SessionData {
        userId: number;
        username: string;
        admin: number | null;
    }
}
declare global {
    namespace Express {
        interface User extends PrismaUser { }
    }
}