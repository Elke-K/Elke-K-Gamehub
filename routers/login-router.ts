import { Router } from "express";
import { Users } from "../types";
import { getUser } from "../database";
import bcrypt from "bcrypt";

let loggedIn: boolean = false;

export function loginRoute(): Router {
  const loginRouter = Router();

  loginRouter.get("/", (req, res) => {
    const themaName: string = res.locals.themaName;

    if (res.locals.user) {
      res.redirect("/profile");
      return;
    }

    // read & clear notification from session
    const notification =
      req.session.notification || (req.query.notification as string) || "";
    req.session.notification = "";

    res.render("login", {
      title: "Inloggen",
      themaName,
      notification,
      loggedIn,
    });
  });

  loginRouter.post("/", async (req, res) => {
    const themaName: string = res.locals.themaName;
    const emailOrUsername: string = req.body.email_username.toLowerCase();
    const password: string = req.body.password;

    try {
      let currentUser: Users | undefined = await getUser(emailOrUsername);

      if (currentUser && currentUser.password) {
        if (
          (currentUser.username.toLowerCase() === emailOrUsername ||
            currentUser.email.toLowerCase()) &&
          (await bcrypt.compare(password, currentUser.password))
        ) {
          loggedIn = true;
          delete currentUser.password;
          req.session.user = currentUser;
          req.session.notification = "Je bent succesvol ingelogd!";
          res.redirect("/profile");
          return;
        } else {
          res.render("login", {
            title: "Inloggen",
            themaName,
            notification: "Het ingevoerde wachtwoord is verkeerd.",
            loggedIn,
          });
          return;
        }
      } else {
        res.render("login", {
          title: "Inloggen",
          themaName,
          notification: "Gebruiker niet gevonden. Maak eerst een account aan!",
          loggedIn,
        });
        return;
      }
    } catch (e: any) {
      console.error("Something went wrong with the database.", e);
    }
  });

  return loginRouter;
}
