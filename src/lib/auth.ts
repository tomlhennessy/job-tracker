import { NextApiRequest } from "next";

export const getTokenFromRequest = (req: NextApiRequest) => {
    const authHeader = req.headers.authorization;
    const tokenFromCookie = req.cookies?.token;

    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.split(" ")[1]; // Extract token from Authorization header
    } else if (tokenFromCookie) {
        return tokenFromCookie; // Extract token from cookie
    }

    return null; // No token found
};
