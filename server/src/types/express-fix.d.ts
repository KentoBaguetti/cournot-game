import { Request, Response, NextFunction } from 'express';
import { PathParams } from 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface IRouterMatcher<T> {
    (path: PathParams, handler: (req: Request, res: Response, next: NextFunction) => any): T;
    (path: PathParams, ...handlers: Array<(req: Request, res: Response, next: NextFunction) => any>): T;
  }
} 