import { Results } from "./types";

import { Users } from "./types";

export function getPaginationButtonState(page: number): "disabled" | "enabled" {
  return page <= 1 ? "disabled" : "enabled";
}

export function takeTopResults<T>(items: T[], amount: number): T[] {
  return items.slice(0, Math.max(0, amount));
}

export function sortByOwnedCount(results: Results[]): Results[] {
  return [...results].sort(
    (a, b) => b.added_by_status["owned"] - a.added_by_status["owned"],
  );
}

export function sortByReviewCount(results: Results[]): Results[] {
  return [...results].sort((a, b) => b.ratings_count - a.ratings_count);
}

export function getDefaultUser(): Users {
  return {
    email: "",
    username: "username",
    password: "",
    level: 1,
    about_me: "Geen info gevonden",
    profile_picture: "/images/user.png",
    collection_more: [],
    public_profile: false,
    reviews: [],
  };
}

export function getDefaultRegisteredUser(
  email: string,
  username: string,
  password: string,
): Users {
  return {
    email,
    username,
    password,
    level: 0,
    about_me: "",
    profile_picture: "",
    public_profile: false,
    collection_more: [
      { collectionName: "Wenslijst", allGames: [] },
      { collectionName: "Favorieten", allGames: [] },
      { collectionName: "Te spelen", allGames: [] },
      { collectionName: "Momenteel aan het spelen", allGames: [] },
      { collectionName: "Afgespeeld", allGames: [] },
    ],
    reviews: [],
  };
}
