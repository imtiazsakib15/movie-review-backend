import { TDecodedUser } from "../auth";

declare global {
  namespace Express {
    interface Request {
      user?: TDecodedUser;
    }
  }
}
