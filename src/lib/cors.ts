import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

export function allowCors(handler: NextApiHandler): NextApiHandler {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const allowedOrigins = [
            "http://localhost:3000",
            "http://localhost:8080",
            "https://your-vercel-app.vercel.app",
            "https://appli.sh",
        ];

        const origin = req.headers.origin;

        if (origin && allowedOrigins.includes(origin)) {
            res.setHeader("Access-Control-Allow-Origin", origin);
        }

        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
        res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization");

        // Handle CORS preflight requests
        if (req.method === "OPTIONS") {
            res.status(200).end();
            return; // Explicitly returning void so TypeScript knows this is expected
        }

        return handler(req, res); // Passes control to the actual API handler
    };
}
