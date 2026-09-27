import { Router } from "express";
import { secureMiddleware } from "../middleware/secureMiddleware";

export const guessRouter = Router();

guessRouter.get("/guess-the-game", secureMiddleware, (req, res) => {
  const themaName: string = res.locals.themaName;

  res.render("guess-the-game", {
    title: "Raad Het Spel",
    themaName: themaName,
    currentPage: "guess-the-game",
  });
});
