import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: "Missing token" });
    }

    // ✅ Store JWT in an HTTP-only cookie
    res.setHeader("Set-Cookie", serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
    }));

    return res.status(200).json({ message: "Token stored in cookie" });
}
