import { Request } from "express";

export interface ExpressRequest extends Request {
  user: {
    id: number;
    // Add other properties if needed
  };
}
