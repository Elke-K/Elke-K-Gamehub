import { GamesApi } from "../types";

export type RawgCache = {
  base?: GamesApi;
  recent?: GamesApi;

  byNameAsc?: GamesApi;
  byNameDes?: GamesApi;
  byRatingAsc?: GamesApi;
  byRatingDes?: GamesApi;
  byYear?: GamesApi;
  single?: GamesApi;
  multi?: GamesApi;

  timestamp?: number;
};

export const rawgCache: RawgCache = {};

export const RAWG_TTL = 1000 * 60 * 10;

export function isRawgCacheValid() {
  return (
    rawgCache.timestamp !== undefined &&
    Date.now() - rawgCache.timestamp < RAWG_TTL
  );
}