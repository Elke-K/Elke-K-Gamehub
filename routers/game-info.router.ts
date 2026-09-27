import { Router } from "express";
import { Game, Users } from "../types";
import {
  addReview,
  getAllUsers,
  addToCollection,
  getUserCollections,
  deleteAllGames,
} from "../database";
import { ObjectId } from "mongodb";
import strict from "node:assert/strict";
import { getFallbackGameById } from "../cache/fallbackGames";

export function gameInfo() {
  const router: Router = Router();

  router.get("/userid", async (req, res) => {
    if (req.session.user?._id === undefined) return;

    res.type("application/json");
    res.json({ userId: req.session.user?._id.toString() });
  });

  router.get("/collections/list", async (req, res) => {
    if (req.session.user?._id === undefined) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const collections = await getUserCollections(
      req.session.user._id.toString(),
    );

    res.type("application/json");
    res.json({ collections });
  });

  router.post("/addToCollection", async (req, res) => {
    const { userId, newCollection } = req.body;
    await addToCollection(userId, newCollection);

    res.send("collection added successfully");
  });

  router.post("/deleteGames", async (req, res) => {
    const { userId, collectionName } = req.body;

    await deleteAllGames(userId, collectionName);

    res.send({
      message: "All games deleted successfully",
    });
  });

  router.get("/:id", async (req, res) => {
    const themaName: string = res.locals.themaName;
    const id: string = req.params.id;
    let newId: number = Number(id);
    if (newId < 0) newId = newId * -1;
    const url: string = `https://api.rawg.io/api/games/${String(newId)}?key=${process.env.RAWG_API_KEY}`;
    const numericId = Number(id);
    let game: Game | null = null;

    console.log(newId);

    if (!Number.isNaN(numericId) && numericId < 0) {
      game = getFallbackGameById(numericId);
    } else {
      try {
        const response = await fetch(url);
        if (response.ok) {
          game = await response.json();
        }
      } catch (error) {
        console.error("RAWG game fetch failed, using fallback", error);
      }
    }

    if (!game && !Number.isNaN(numericId)) {
      game = getFallbackGameById(numericId);
    }

    if (!game) {
      res.status(404).render("error", {
        title: "Game not found",
        message: "Game data is currently unavailable.",
      });
      return;
    }
    const allUsers: Users[] = await getAllUsers();
    let reviewCount = 0;

    for (let user of allUsers) {
      for (let userrv of user.reviews) {
        if (userrv.gameId === req.params.id) {
          reviewCount += 1;
        }
      }
    }

    const res1 = await fetch(
      "https://translation.googleapis.com/language/translate/v2?key=AIzaSyCLA2ozIXRi4bj1JChJ9V-uVMCRa6g6Llc",
      {
        method: "POST",
        body: JSON.stringify({
          q: game.description_raw,
          target: "nl",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await res1.json();
    game.description_raw = data.data.translations[0].translatedText;

    res.render("game-info", {
      themaName: themaName,
      title: game.name,
      game: game,
      allUsers,
      gameId: req.params.id,
      reviewCount,
    });
  });

  router.post("/:id", async (req, res) => {
    const reviewtxt: string = req.body.reviewtxt;
    const reviewrating: string = req.body.reviewrating;

    if (req.session.user?._id === undefined) return;
    await addReview(
      reviewtxt,
      parseInt(reviewrating),
      req.params.id,
      req.session.user?._id.toString(),
    );

    res.redirect(`/game-info/${req.params.id}`);
  });

  return router;
}
