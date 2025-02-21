import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

export function allowCors(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const allowedOrigins = [
      "http://localhost:3000", // Local frontend
      "http://localhost:8080", // Local backend
      "https://appli.sh", // Production frontend (Vercel)
      "http://job-tracker-env.eba-s3uwgj7a.us-east-1.elasticbeanstalk.com:8080", // Production backend
    ];

    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization"
    );

    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return; // Exit the function early for preflight requests
    }

    return handler(req, res); // Pass control to API handler
  };
}
