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

                const isValid = await bcrypt.compare(
                    credentials.password,
                    user.hashedPassword
                );
                if (!isValid) {
                    throw new Error("Invalid credentials");
                }

                return user; // ✅ Return as User or null (type-safe)
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },

    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: user.email! },
                });

                if (!dbUser && account?.provider !== "credentials") {
                    const newUser = await prisma.user.create({
                        data: {
                            email: user.email!,
                            name: user.name || "No Name",
                            hashedPassword: "",
                        },
                    });
                    console.log("Created new user for OAuth:", newUser);
                    token.id = newUser.id; // ✅ Use the newly created user's ID
                } else {
                    token.id = dbUser?.id || user.id;
                }
            }
            return token;
        },

        async session({ session, token }) {
            if (session?.user && token?.id) {
                (session.user as { id?: string }).id = token.id as string;
            }
            return session;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
