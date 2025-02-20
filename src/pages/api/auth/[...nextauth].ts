import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                url: "https://accounts.google.com/o/oauth2/auth",
                params: { prompt: "consent", access_type: "offline", response_type: "code" },
            },
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
                    throw new Error("Email and password required");
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

                return user;
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },

    cookies: {
        sessionToken: {
            name: `next-auth.session-token.${process.env.NODE_ENV}`,
            options: {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
            },
        },
    },

    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.isNewUser = account?.provider !== "credentials";
            }
            return token;
        },

        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
            }
            return session;
        },

        async redirect({ url, baseUrl }) {
            console.log("Redirecting to:", url);
            if (url.includes("/api/auth/error")) {
                return baseUrl + "/login"; // Send failed logins to login page
            }
            return url.startsWith(baseUrl) ? url : baseUrl + "/dashboard";
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
    debug: true, // Enable debugging in logs
};

export default NextAuth(authOptions);
