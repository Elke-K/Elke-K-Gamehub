import { Request, Response, NextFunction } from "express";

export const handleError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(400).render("error", {
    message: err.message,
    themaName: res.locals.themaName,
  });
};
