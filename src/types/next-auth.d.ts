import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
    }

    interface Session extends DefaultSession {
        user: User;
    }

    interface JWT {
        sub: string;
    }
}
