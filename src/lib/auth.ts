import { NextApiRequest } from "next";

export const getTokenFromRequest = (req: NextApiRequest) => {
    const tokenFromCookie = req.cookies?.["next-auth.session-token"]; // ✅ Ensures cookies are accessible

    console.log("🔍 Extracted Token from Cookies:", tokenFromCookie);

    if (tokenFromCookie) {
        return tokenFromCookie; // ✅ Extract token from cookie
    }

    console.log("❌ No Token Found in Cookies");
    return null; // ❌ No token found
};
