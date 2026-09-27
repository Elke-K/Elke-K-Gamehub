import { Router } from "express";
import { secureMiddleware } from "../middleware/secureMiddleware";

export const compareRouter = Router();

compareRouter.get("/compare-games", secureMiddleware, (req, res) => {
  const themaName: string = res.locals.themaName;

  res.render("compare-games", {
    title: "Games Vergelijken",
    themaName: themaName,
    currentPage: "compare-games",
  });
});
