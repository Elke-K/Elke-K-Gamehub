import { Router } from "express";
import {
  increaseCounter,
  decreaseCounter,
  counter,
  searchGame,
  getRecentGameswithPageSize,
} from "../database";
import { Results } from "../types";
import { getPaginationButtonState, sortByReviewCount } from "../methods";
import { rawgCache } from "../cache/rawgCache";
import { getOrLoadSearch } from "../cache/searchCache";

export function games() {
  const router: Router = Router();

  router.get("/search-suggestions", async (req, res) => {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

    if (!query) {
      res.json({ suggestions: [] });
      return;
    }

    try {
      const result = await getOrLoadSearch(query, () => searchGame(query));
      const suggestions = (result.results ?? [])
        .slice(0, 8)
        .map((game) => ({ id: game.id, name: game.name }));

      res.json({ suggestions });
    } catch (error) {
      console.error("Game suggestions ophalen mislukt:", error);
      res.status(500).json({ suggestions: [] });
    }
  });

  router.get("/games-partial", (req, res) => {
    const page = parseInt(req.query.page as string) || 0;
    const sortfield =
      typeof req.query.sortfield === "string"
        ? req.query.sortfield
        : "ratingDesc";
    const PAGE_SIZE = 20;

    const cacheMap: Record<string, Results[] | undefined> = {
      Name_alphabetically_A_Z: rawgCache.byNameAsc?.results,
      Name_alphabetically_Z_A: rawgCache.byNameDes?.results,
      ratingAsc: rawgCache.byRatingAsc?.results,
      ratingDesc: rawgCache.byRatingDes?.results,
      releaseYearAsc: rawgCache.byYear?.results,
      releaseYearDesc: rawgCache.recent?.results,
      singlePlayer: rawgCache.single?.results,
      multiplayer: rawgCache.multi?.results,
      reviewCount: sortByReviewCount(rawgCache.base?.results ?? []),
    };

    const allGames =
      cacheMap[sortfield] ?? rawgCache.byRatingDes?.results ?? [];
    const showAllGames = allGames.slice(
      page * PAGE_SIZE,
      (page + 1) * PAGE_SIZE,
    );
    const isFirstPage = page === 0;
    const isLastPage = (page + 1) * PAGE_SIZE >= allGames.length;

    res.json({ showAllGames, page, isFirstPage, isLastPage });
  });

  router.get("/", async (req, res) => {
    const themaName: string = res.locals.themaName;
    const previousBtn = req.query.previous_btn;
    const nextBtn = req.query.next_btn;
    const search = req.query.search;
    const clearField = req.query.clearField;

    let searchGame1 =
      typeof req.query.searchGame === "string"
        ? req.query.searchGame.trim()
        : "";
    if (clearField === "clicked") searchGame1 = "";

    const searchActive = searchGame1 !== "";
    const sortfield = searchActive
      ? ""
      : typeof req.query.sortfield === "string"
        ? req.query.sortfield
        : "ratingDesc";

    if (previousBtn === "clicked") decreaseCounter();
    else if (nextBtn === "clicked") increaseCounter();

    let showAllGames: Results[];

    if (searchGame1 !== "") {
      const result = await getOrLoadSearch(searchGame1, () =>
        searchGame(searchGame1),
      );
      showAllGames = result.results;
    } else if (search === "clicked") {
      const cacheMap: Record<string, Results[] | undefined> = {
        Name_alphabetically_A_Z: rawgCache.byNameAsc?.results,
        Name_alphabetically_Z_A: rawgCache.byNameDes?.results,
        ratingAsc: rawgCache.byRatingAsc?.results,
        ratingDesc: rawgCache.byRatingDes?.results,
        releaseYearAsc: rawgCache.byYear?.results,
        releaseYearDesc: rawgCache.recent?.results,
        singlePlayer: rawgCache.single?.results,
        multiplayer: rawgCache.multi?.results,
        reviewCount: sortByReviewCount(rawgCache.base?.results ?? []),
      };
      showAllGames = cacheMap[sortfield] ?? rawgCache.base?.results ?? [];
    } else {
      try {
        await getRecentGameswithPageSize();
      } catch (error) {
        console.error("RAWG page fetch failed, using cache", error);
      }
      showAllGames = rawgCache.byRatingDes?.results ?? [];
    }

    res.render("games", {
      title: "Games",
      themaName,
      currentPage: "games",
      filterClassName: "",
      showAllGames,
      previousBtnDisableValue: getPaginationButtonState(counter),
      sortfield,
      searchGame: searchGame1,
      searchActive,
    });
  });

  return router;
}
