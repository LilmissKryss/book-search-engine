import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const secret = process.env.JWT_SECRET || "supersecret";
const expiration = "2h";

export const signToken = (user: any) => {
  const payload = { _id: user._id, email: user.email, username: user.username };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};

// Middleware for Express & Apollo
export const authMiddleware = (
  req: Request,
  res?: Response | undefined,
  next?: NextFunction
): Request | null | Response | void => {
  // <-- Ensure function returns something
  let token =
    req.headers.authorization?.split("Bearer ")[1] ||
    (req.query.token as string);

  if (!token) {
    if (res) {
      return res.status(403).json({ message: "Unauthorized" }); // Return for Express
    }
    return null; // Return `null` for Apollo
  }

  try {
    const decoded: any = jwt.verify(token as string, secret);
    req.user = decoded.data;
  } catch (error) {
    console.log("Invalid token");
    if (res) {
      return res.status(403).json({ message: "Invalid token" }); // Return for Express
    }
    return null; // Return `null` for Apollo context
  }

  if (next) {
    return next(); // Ensure Express continues execution
  }

  return req; // Return the request object for Apollo context
};
