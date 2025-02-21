import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

export function allowCors(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const allowedOrigins = process.env.NODE_ENV === "production"
      ? ["https://appli.sh", "http://backend:8080"] // ✅ Allow production frontend & backend
      : ["http://localhost:3000", "http://backend:8080", "http://host.docker.internal:8080"]; // ✅ Allow local Docker services

    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Access-Control-Allow-Credentials", "true"); // Allow cookies/authentication
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization"
    );

    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }

    return handler(req, res);
  };
}
