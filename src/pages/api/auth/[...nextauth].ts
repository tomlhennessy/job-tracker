import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        email: string;
        accessToken?: string | null; // ✅ Allow null explicitly
    }
}

declare module "next-auth" {
    interface Session {
        accessToken?: string | null; // ✅ Allow null explicitly
        user: {
            id: string;
            email: string;
        };
    }
}


const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,  // ✅ Ensures Prisma reads the correct DB URL
        },
    },
});

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Email & Password",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.hashedPassword) {
                    throw new Error("Invalid credentials");
                }

                const isValid = await bcrypt.compare(credentials.password, user.hashedPassword);
                if (!isValid) {
                    throw new Error("Invalid credentials");
                }

                // ✅ Generate JWT Token
                const token = jwt.sign(
                    { id: user.id, email: user.email },
                    process.env.NEXTAUTH_SECRET!,
                    { expiresIn: "7d" }
                );

                return { ...user, accessToken: token }; // ✅ Return JWT instead of setting cookie
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user && "accessToken" in user) {
                token.accessToken = typeof user.accessToken === "string" ? user.accessToken : "";
            }
            return token;
        },

        async session({ session, token }) {
            session.user.id = token.id;
            session.user.email = token.email;
            session.accessToken = typeof token.accessToken === "string" ? token.accessToken : "";
            return session;
        }
    },

    secret: process.env.NEXTAUTH_SECRET,
    debug: true,
};

export default NextAuth(authOptions);
