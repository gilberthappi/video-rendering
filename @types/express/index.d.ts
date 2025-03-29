import { TUser } from "../../src/utils/interfaces/common";

declare module "express-serve-static-core" {
  interface Request {
    user?: TUser;
  }
}
