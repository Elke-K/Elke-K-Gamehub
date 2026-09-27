import { Router } from "express";
import {
  decreaseCounter,
  increaseCounter,
  counter,
  getRecentGameswithPageSize,
} from "../database";
import { Results } from "../types";
import {
  getPaginationButtonState,
  sortByOwnedCount,
  takeTopResults,
} from "../methods";
import { rawgCache } from "../cache/rawgCache";
import { startCacheWorker } from "../cache/startCacheWorker";

startCacheWorker();

export function home() {
  const router = Router();

  // Partial endpoint — fetches correct page from RAWG (cached per page)
  router.get("/games-partial", (req, res) => {
    const page = parseInt(req.query.page as string) || 0;
    const PAGE_SIZE = 20;

    const allGames = rawgCache.byRatingDes?.results ?? []; // changed
    const showAllGames = allGames.slice(
      page * PAGE_SIZE,
      (page + 1) * PAGE_SIZE,
    );
    const isFirstPage = page === 0;
    const isLastPage = (page + 1) * PAGE_SIZE >= allGames.length;

    res.json({ showAllGames, page, isFirstPage, isLastPage });
  });

  router.get("/", (req, res) => {
    const themaName: string = res.locals.themaName;

    const popularGames: Results[] = sortByOwnedCount(
      rawgCache.base?.results ?? [],
    );
    const mostPopulareGames: Results[] = takeTopResults(popularGames, 10);
    const allrecentGames: Results[] = takeTopResults(
      rawgCache.recent?.results ?? [],
      10,
    );
    const showAllGames: Results[] =
      rawgCache.byRatingDes?.results.slice(0, 20) ?? [];

    res.render("home", {
      title: "GameHub",
      themaName,
      currentPage: "home",
      mostPopulareGames,
      allrecentGames,
      showAllGames,
      previousBtnDisableValue: getPaginationButtonState(counter),
    });
  });

  return router;
}
