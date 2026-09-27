import { NextFunction, Request, Response } from "express";
import { getRecentUserInfo } from "../database";
import { Users } from "../types";

export async function secureMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user?._id) {
    return res.redirect("/login");
  }

  const currentUserInfo = await getRecentUserInfo(String(req.session.user._id));

  if (!currentUserInfo) {
    return req.session.destroy(() => res.redirect("/login"));
  }

  req.session.user = currentUserInfo;
  res.locals.user = currentUserInfo;
  const currentlyPlayingCol = currentUserInfo.collection_more.find(
    (c) => c.collectionName === "Momenteel aan het spelen",
  )?.allGames[0];
  res.locals.currently_playing = currentlyPlayingCol?.gameName;
  res.locals.currently_playing_id = currentlyPlayingCol?.gameId;
  next();
}