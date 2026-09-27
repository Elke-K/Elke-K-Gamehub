import { Router } from "express";
import { Resend } from "resend";
import bcrypt from "bcrypt";
import crypto from "crypto";

import {
  getUser,
  createPasswordResetToken,
  getPasswordResetToken,
  deletePasswordResetToken,
  updatePassword,
} from "../database";

const resend = new Resend(process.env.RESEND_API_KEY!);

export function resetPasswordRoute(): Router {
  const resetRouter = Router();

  resetRouter.get("/", (req, res) => {
    const themaName: string = res.locals.themaName;

    res.render("reset-password", {
      title: "Wachtwoord reset",
      themaName,
      notification: "",
    });
  });

  //EMAIL WITH RESET HAS SENT!

  resetRouter.post("/", async (req, res) => {
    try {
      const email: string = req.body.email.toLowerCase();

      const user = await getUser(email);

      // never reveal if user exists
      if (!user) {
        return res.render("reset-password", {
          title: "Reset wachtwoord",
          themaName: res.locals.themaName,
          notification: "Als het account bestaat is er een email verstuurd.",
        });
      }

      const token = crypto.randomBytes(32).toString("hex");

      const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

      await createPasswordResetToken(user._id!.toString(), token, expiresAt);

      const resetLink = `https://wpl.khqledsyr.tech/reset-password/${token}`;

      await resend.emails.send({
        from: "noreply@khqledsyr.tech",
        to: user.email,
        subject: "Reset je wachtwoord",
        html: `
          <h1>Wachtwoord reset</h1>

          <p>Klik hieronder:</p>

          <a href="${resetLink}">
            Reset wachtwoord
          </a>

          <p>Deze link verloopt binnen 1 uur.</p>
        `,
      });
      console.log("noreply@khqledsyr.tech".charCodeAt(28));
      res.render("reset-password", {
        title: "Reset wachtwoord",
        themaName: res.locals.themaName,
        notification: "Als het account bestaat is er een email verstuurd.",
      });
    } catch (e) {
      console.log(e);

      res.status(500).send("Server error");
    }
  });

  //NEW PASSWORD PAGE

  resetRouter.get("/:token", async (req, res) => {
    try {
      const token: string = req.params.token;
      const themaName: string = res.locals.themaName;

      const resetDoc = await getPasswordResetToken(token);

      if (!resetDoc) {
        return res.send("Token ongeldig of verlopen.");
      }

      res.render("new-password", {
        title: "Nieuw wachtwoord",
        themaName,
        token,
        notification: "",
      });
    } catch (e) {
      console.log(e);

      res.status(500).send("Server error");
    }
  });

  resetRouter.post("/:token", async (req, res) => {
    try {
      const token: string = req.params.token;
      const password: string = req.body.password;
      const confirmPassword: string = req.body.confirmPassword;
      const themaName: string = res.locals.themaName;

      const resetDoc = await getPasswordResetToken(token);

      if (!resetDoc) {
        return res.send("Token ongeldig of verlopen.");
      }

      if (!password || password.length < 8) {
        return res.render("new-password", {
          title: "Nieuw wachtwoord",
          themaName,
          token,
          notification: "Het wachtwoord moet minstens 8 tekens bevatten.",
        });
      }

      if (password !== confirmPassword) {
        return res.render("new-password", {
          title: "Nieuw wachtwoord",
          themaName,
          token,
          notification: "De wachtwoorden komen niet overeen.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await updatePassword(resetDoc.userId, hashedPassword);

      await deletePasswordResetToken(token);

      req.session.notification =
        "Wachtwoord succesvol bijgewerkt. Log opnieuw in.";
      res.redirect("/login");
    } catch (e) {
      console.log(e);

      res.status(500).send("Server error");
    }
  });

  return resetRouter;
}
