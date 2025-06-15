import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {}
    interface Response {}
  }
}

declare module 'express' {
  interface IRouterMatcher<T> {
    (path: string, ...handlers: Array<(req: Request, res: Response, next: NextFunction) => any>): T;
  }
} 