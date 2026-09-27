import { NextFunction, Request, Response } from "express";

export class ThemeMiddleware {
  private static getThemeFromCookie(
    cookieHeader: string | undefined,
  ): "light" | "dark" | undefined {
    if (!cookieHeader) return undefined;

    const cookieValue = cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("theme="));

    if (!cookieValue) return undefined;

    const theme = cookieValue.slice("theme=".length);
    return theme === "light" || theme === "dark" ? theme : undefined;
  }

  private static resolveTheme(req: Request, res: Response): "light" | "dark" {
    const queryTheme =
      typeof req.query.theme === "string"
        ? req.query.theme
        : typeof req.query.themeHome === "string"
          ? req.query.themeHome
          : undefined;

    const normalizedQueryTheme =
      queryTheme === "light" || queryTheme === "dark" ? queryTheme : undefined;
    const cookieTheme = ThemeMiddleware.getThemeFromCookie(req.headers.cookie);
    const selectedTheme = normalizedQueryTheme ?? cookieTheme ?? "dark";

    if (normalizedQueryTheme) {
      res.cookie("theme", normalizedQueryTheme, {
        maxAge: 1000 * 60 * 60 * 24 * 365,
        sameSite: "lax",
        path: "/",
      });
    }

    return selectedTheme;
  }

  static apply(req: Request, res: Response, next: NextFunction): void {
    res.locals.themaName = ThemeMiddleware.resolveTheme(req, res);
    res.locals.currentPath = req.path;

    const currentQuery: Record<string, string | string[]> = {};

    for (const [key, value] of Object.entries(req.query)) {
      if (key === "theme" || key === "themeHome") continue;

      if (typeof value === "string") {
        currentQuery[key] = value;
        continue;
      }

      if (Array.isArray(value)) {
        currentQuery[key] = value.filter(
          (item): item is string => typeof item === "string",
        );
      }
    }

    res.locals.currentQuery = currentQuery;
    next();
  }
}