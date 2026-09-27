import { Router } from "express";
import { getAllUsers } from "../database";

export function communityRoute() {
  const router = Router();

  router.get("/", async (req, res) => {
    const themaName: string = res.locals.themaName;
    const searchTermRaw =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const searchTerm = searchTermRaw.toLowerCase();

    const allPublicUsers = (await getAllUsers())
      .filter((user) => user.public_profile)
      .sort((leftUser, rightUser) => {
        const levelDiff = rightUser.level - leftUser.level;
        if (levelDiff !== 0) return levelDiff;

        return leftUser.username.localeCompare(rightUser.username, "nl", {
          sensitivity: "base",
        });
      });

    const publicUsers = allPublicUsers.filter((user) => {
      if (!searchTerm) return true;
      return user.username.toLowerCase().includes(searchTerm);
    });

    res.render("community", {
      title: "Community",
      themaName,
      currentPage: "community",
      currentPath: "/community",
      currentQuery: searchTermRaw ? { search: searchTermRaw } : {},
      searchTerm: searchTermRaw,
      publicUsers,
      totalPublicUsers: allPublicUsers.length,
    });
  });

  return router;
}
