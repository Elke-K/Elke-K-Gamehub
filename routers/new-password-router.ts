import { Router } from "express";
import bcrypt from "bcrypt";
import { updatePassword } from "../database";

export function newPasswordRoute(): Router {
  const newPasswordRouter = Router();

  newPasswordRouter.get("/", (req, res) => {
    if (!req.session.user?._id) {
      return res.redirect("/login");
    }

    const themaName: string = res.locals.themaName;
    const notification = req.session.notification ?? "";
    req.session.notification = "";

    res.render("new-password", {
      title: "Nieuw wachtwoord",
      themaName,
      notification,
    });
  });

  newPasswordRouter.post("/", async (req, res) => {
    if (!req.session.user?._id) {
      return res.redirect("/login");
    }

    const themaName: string = res.locals.themaName;
    const password: string = req.body.password;
    const confirmPassword: string = req.body.confirmPassword;

    if (!password || password.length < 8) {
      return res.render("new-password", {
        title: "Nieuw wachtwoord",
        themaName,
        notification: "Het wachtwoord moet minstens 8 tekens bevatten.",
      });
    }

    if (password !== confirmPassword) {
      return res.render("new-password", {
        title: "Nieuw wachtwoord",
        themaName,
        notification: "De wachtwoorden komen niet overeen.",
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await updatePassword(req.session.user._id.toString(), hashedPassword);
      req.session.notification = "Wachtwoord succesvol bijgewerkt.";
      return res.redirect("/profile");
    } catch (error) {
      console.error("Error updating password:", error);
      return res.render("new-password", {
        title: "Nieuw wachtwoord",
        themaName,
        notification: "Er is iets misgegaan, probeer het opnieuw.",
      });
    }
  });

  return newPasswordRouter;
}
