import { Router } from "express";
export function index() {
  const router: Router = Router();

  router.get("/", (req, res) => {
    const theme = req.query.theme === "light";
    const themaName = theme ? "light" : "dark";

    res.render("index", {
      title: "Onze games",
      themaName: themaName,
      currentPage: "home",
    });
  });

  return router;
}
