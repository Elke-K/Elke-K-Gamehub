import { Router } from "express";
import { Users } from "../types";
import { getDefaultUser } from "../methods";
import {
  getUser,
  updateUser,
  updateUserPicture,
  getAllCollectionsAndGamesOfCollections,
  deleteCollection,
  deleteGameFromCollection,
  updateProfileStatus,
  getUserById,
} from "../database";

export function profileRoute() {
  const profileRouter = Router();

  profileRouter.get("/", async (req, res) => {
    const themaName: string = res.locals.themaName;
    const user: Users = res.locals.user;

    if (req.session.user?._id === undefined) return;

    const currentUser: Users | undefined = await getUserById(
      req.session.user?._id.toString(),
    );

    const notification = req.session.notification ?? "";
    req.session.notification = "";

    res.render("profile", {
      title: "Profiel",
      themaName: themaName,
      username: user.username,
      aboutMe: user.about_me,
      email: user.email,
      lvl: user.level,
      imageSrc: user.profile_picture,
      collections: user.collection_more,
      publicProfile: currentUser?.public_profile,
      currentPage: "profile",
      notification,
    });
  });

  profileRouter.get("/collection", async (req, res) => {
    if (req.session.user?._id === undefined) return;
    let user: Users | undefined = await getAllCollectionsAndGamesOfCollections(
      req.session.user?._id?.toString(),
    );

    res.type("application/json");
    res.json({ user: user });
  });

  profileRouter.post("/", async (req, res) => {
    const user: Users = res.locals.user;

    user.about_me = req.body.about;
    user.username = req.body.username.toLowerCase();
    user.email = req.body.email.toLowerCase();
    user.public_profile = req.body.public === "on";

    const publicProfile: string = req.body.public;
    if (req.session.user?._id === undefined) return;
    if (publicProfile === "on") {
      await updateProfileStatus(req.session.user?._id.toString(), true);
    } else {
      await updateProfileStatus(req.session.user?._id.toString(), false);
    }
    if (!user.username || user.username.length > 30) {
      console.log(
        "Gebruikersnaam niet ingevud, of je gebruikersnaam lengte is groter dan 30.",
      );
      res.redirect("/profile");
    }

    if (!user.email || !user.email.includes("@")) {
      console.log("Email is niet ingevud, of je email is niet geldig.");
      res.redirect("/profile");
    }
    await updateUser(user);

    res.redirect("/profile");
  });

  profileRouter.post("/picture", async (req, res) => {
    const user: Users = res.locals.user;
    const image = req.body.image;

    if (!image) {
      return res.status(400).json({ error: "Geen afbeelding" });
    }

    res.locals.user.profile_picture = image;
    await updateUserPicture(user, image);

    res.json({ success: true });
  });

  profileRouter.post("/deletecollection", async (req, res) => {
    const { userId, name } = req.body;
    await deleteCollection(userId, name);
    res.send("collection was deleted successfully");
  });

  profileRouter.post("/deletegame", async (req, res) => {
    const { userId, name, gameId } = req.body;
    await deleteGameFromCollection(userId, name, gameId);
    res.send("game was deleted successfully");
  });

  return profileRouter;
}

export function PublicProfileRoute() {
  const profileRouter = Router();

  profileRouter.get("/:username", async (req, res) => {
    const themaName: string = res.locals.themaName;

    const username: string = req.params.username;

    if (!username) {
      console.log("gebruikersnaam niet gevonden!");
    }

    let user: Users | undefined = await getUser(username);

    if (!user) {
      user = getDefaultUser();
    }

    res.render("public-profile", {
      title: "Publiek profiel",
      themaName: themaName,
      username: user.username,
      aboutMe: user.about_me,
      email: user.email,
      lvl: user.level,
      imageSrc: user.profile_picture,
      collections: user.collection_more,
      publicProfile: user.public_profile,
      publicProfilePage: true,
      currentPage: "profile",
    });
  });

  return profileRouter;
}
