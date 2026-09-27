import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import session from "./session";

import { index } from "./routers/index.router";
import { home } from "./routers/home.router";
import { games } from "./routers/games.router";
import { gameInfo } from "./routers/game-info.router";
import { communityRoute } from "./routers/community-router";

import { compareRouter } from "./routers/compare.router";
import { guessRouter } from "./routers/guess.router";
import { profileRoute, PublicProfileRoute } from "./routers/profile-router";
import { ThemeMiddleware } from "./middleware/theme-middleware";
import { secureMiddleware } from "./middleware/secureMiddleware";
import { registerRoute } from "./routers/register-router";
import { loginRoute } from "./routers/login-router";
import { connect, seedFallbackGamesIfEmpty } from "./database";
import { handleError } from "./routers/errorhandeler";
import { logoutRouter } from "./routers/logout-router";
import { resetPasswordRoute } from "./routers/reset-password-router";
import { startCacheWorker } from "./cache/startCacheWorker";
import { newPasswordRoute } from "./routers/new-password-router";

dotenv.config();

const app: Express = express();

app.set("view engine", "ejs");

app.use(express.json({ limit: "10mb" }));
app.use(session);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT || 3000);

let notification: string = "";
let loggedIn = false;
let counterShowFilters = 1;


app.use(ThemeMiddleware.apply);
app.use("/", index());
app.use("/home", secureMiddleware, home());
app.use("/games", secureMiddleware, games());
app.use("/game-info", secureMiddleware, gameInfo());
app.use("/community", secureMiddleware, communityRoute());

app.use(compareRouter);
app.use(guessRouter);

app.use("/login", loginRoute());
app.use("/logout", logoutRouter());
app.use("/register", registerRoute());
app.use("/reset-password", resetPasswordRoute());
app.use("/new-password", newPasswordRoute());
app.use("/profile", secureMiddleware, profileRoute());
app.use("/public-profile", secureMiddleware, PublicProfileRoute());

app.get("/info", (req, res) => {
  const themaName: string = res.locals.themaName;

  res.render("info", {
    title: "Info",
    themaName: themaName,
    currentPage: "info",
  });
});

app.use(handleError);

app.listen(app.get("port"), async () => {
  await connect();
  await seedFallbackGamesIfEmpty();
  await startCacheWorker();
  console.log("Server started on http://localhost:" + app.get("port"));
});
