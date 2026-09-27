import { Router } from "express";

export function logoutRouter() {
  const router = Router();

  router.get("/", (req, res) => {
    req.session.destroy(() => {
      res.redirect("/login?notification=Je+bent+succesvol+uitgelogd!");
    });
  });

  return router;
}
