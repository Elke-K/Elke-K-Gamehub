import { Router } from "express";
import { Users } from "../types";
import { checkIfUserExists, registerUser } from "../database";
import { getDefaultRegisteredUser } from "../methods";
import bcrypt from "bcrypt";

let notification: string = "";
let loggedIn: boolean = false;

export function registerRoute(): Router {
  const registerRouter = Router();

  registerRouter.get("/", (req, res) => {
    const themaName: string = res.locals.themaName;

    res.render("register", {
      title: "Registreren",
      themaName: themaName,
      notification: notification,
    });
  });

  registerRouter.post("/", async (req, res) => {
    const themaName: string = res.locals.themaName;

    const saltRounds: number = 10;

    if (
      req.body.email.toLowerCase() === undefined ||
      req.body.username.toLowerCase() === undefined ||
      req.body.password === undefined
    ) {
      notification = "Je moet alle velden invullen.";
      res.render("register", {
        title: "Registreren",
        themaName: themaName,
        notification: notification,
      });
      return;
    }

    const email: string = req.body.email.toLowerCase();
    const username: string = req.body.username.toLowerCase();
    const password: string = await bcrypt.hash(req.body.password, saltRounds);

    const newUser: Users = getDefaultRegisteredUser(email, username, password);

    try {
      let userExists: boolean = await checkIfUserExists(email, username);

      if (req.body.password.length < 8) {
        notification = "Uw wachtwoord moet minstens 8 karakters bevatten.";
        res.render("register", {
          title: "Registreren",
          themaName: themaName,
          notification: notification,
        });
        return;
      }

      if (userExists) {
        notification = "Deze gebruikersnaam of e-mail bestaat al.";
        res.render("register", {
          title: "Registreren",
          themaName: themaName,
          notification: notification,
        });
        return;
      }

      await registerUser(newUser);
      req.session.notification =
        "Gebruiker succesvol geregistreerd! Je kan nu inloggen.";
      return res.redirect("/login");
    } catch (e) {
      console.error("Er ging iets mis.");
    }
  });

  return registerRouter;
}
