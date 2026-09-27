import { Double } from "mongodb";
import { Game, Results } from "../types";

type FallbackTag = "singleplayer" | "multiplayer";

export type FallbackSeed = {
  id: number;
  name: string;
  released: string;
  rating: number;
  ratings_count: number;
  tags: FallbackTag[];
  image?: string;
};

const FALLBACK_IMAGE = "/images/sword.png";

const TAGS: Record<FallbackTag, { id: number; name: string; slug: string }> = {
  singleplayer: { id: 1, name: "Singleplayer", slug: "singleplayer" },
  multiplayer: { id: 2, name: "Multiplayer", slug: "multiplayer" },
};

const DEFAULT_GENRE = {
  id: 1,
  name: "Action",
  slug: "action",
  games_count: 0,
  image_background: "",
};

export const fallbackSeeds: FallbackSeed[] = [
  {
    id: -1,
    name: "Grand Theft Auto V",
    released: "2013-09-17",
    rating: 4.5,
    ratings_count: 5000,
    tags: ["singleplayer", "multiplayer"],
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg",
  },
  {
    id: -2,
    name: "The Witcher 3: Wild Hunt",
    released: "2015-05-18",
    rating: 4.7,
    ratings_count: 4500,
    tags: ["singleplayer"],
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg",
  },
  {
    id: -3,
    name: "Red Dead Redemption 2",
    released: "2018-10-26",
    rating: 4.8,
    ratings_count: 4200,
    tags: ["singleplayer", "multiplayer"],
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg",
  },
  {
    id: -4,
    name: "Minecraft",
    released: "2011-11-18",
    rating: 4.4,
    ratings_count: 5200,
    tags: ["singleplayer", "multiplayer"],
  },
  {
    id: -5,
    name: "Fortnite",
    released: "2017-07-21",
    rating: 4.0,
    ratings_count: 6000,
    tags: ["multiplayer"],
  },
  {
    id: -6,
    name: "Call of Duty: Modern Warfare II",
    released: "2022-10-28",
    rating: 3.9,
    ratings_count: 3500,
    tags: ["multiplayer"],
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1938090/header.jpg",
  },
  {
    id: -7,
    name: "Elden Ring",
    released: "2022-02-25",
    rating: 4.8,
    ratings_count: 4100,
    tags: ["singleplayer", "multiplayer"],
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg",
  },
  {
    id: -8,
    name: "The Legend of Zelda: Breath of the Wild",
    released: "2017-03-03",
    rating: 4.9,
    ratings_count: 3900,
    tags: ["singleplayer"],
  },
  {
    id: -9,
    name: "God of War (2018)",
    released: "2018-04-20",
    rating: 4.8,
    ratings_count: 3800,
    tags: ["singleplayer"],
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/header.jpg",
  },
  {
    id: -10,
    name: "The Last of Us",
    released: "2013-06-14",
    rating: 4.8,
    ratings_count: 3600,
    tags: ["singleplayer"],
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1888930/header.jpg",
  },
  {
    id: -11,
    name: "Cyberpunk 2077",
    released: "2020-12-10",
    rating: 3.8,
    ratings_count: 3400,
    tags: ["singleplayer"],
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
  },
  {
    id: -12,
    name: "Hades",
    released: "2020-09-17",
    rating: 4.7,
    ratings_count: 2800,
    tags: ["singleplayer"],
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg",
  },
  {
    id: -13,
    name: "Stardew Valley",
    released: "2016-02-26",
    rating: 4.6,
    ratings_count: 3000,
    tags: ["singleplayer", "multiplayer"],
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg",
  },
  {
    id: -14,
    name: "Among Us",
    released: "2018-06-15",
    rating: 4.1,
    ratings_count: 2600,
    tags: ["multiplayer"],
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/945360/header.jpg",
  },
  {
    id: -15,
    name: "Apex Legends",
    released: "2019-02-04",
    rating: 4.2,
    ratings_count: 3300,
    tags: ["multiplayer"],
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg",
  },
  {
    id: -16,
    name: "Overwatch 2",
    released: "2022-10-04",
    rating: 3.7,
    ratings_count: 2400,
    tags: ["multiplayer"],
  },
  {
    id: -17,
    name: "League of Legends",
    released: "2009-10-27",
    rating: 4.3,
    ratings_count: 5000,
    tags: ["multiplayer"],
  },
  {
    id: -18,
    name: "Valorant",
    released: "2020-06-02",
    rating: 4.2,
    ratings_count: 2900,
    tags: ["multiplayer"],
  },
  {
    id: -19,
    name: "Counter-Strike 2",
    released: "2023-09-27",
    rating: 4.1,
    ratings_count: 3100,
    tags: ["multiplayer"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
  },
  {
    id: -20,
    name: "Dota 2",
    released: "2013-07-09",
    rating: 4.2,
    ratings_count: 3200,
    tags: ["multiplayer"],
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg",
  },
  {
    id: -21,
    name: "Rocket League",
    released: "2015-07-07",
    rating: 4.3,
    ratings_count: 2700,
    tags: ["multiplayer"],
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/252950/header.jpg",
  },
  {
    id: -22,
    name: "Baldur's Gate 3",
    released: "2023-08-03",
    rating: 4.9,
    ratings_count: 2900,
    tags: ["singleplayer", "multiplayer"],
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg",
  },
  {
    id: -23,
    name: "Hogwarts Legacy",
    released: "2023-02-10",
    rating: 4.3,
    ratings_count: 2600,
    tags: ["singleplayer"],
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/990080/header.jpg",
  },
  {
    id: -24,
    name: "Resident Evil 4",
    released: "2023-03-24",
    rating: 4.6,
    ratings_count: 2100,
    tags: ["singleplayer"],
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/2050650/header.jpg",
  },
  {
    id: -25,
    name: "Halo Infinite",
    released: "2021-12-08",
    rating: 4.0,
    ratings_count: 2000,
    tags: ["multiplayer"],
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1240440/header.jpg",
  },
  {
    id: -26,
    name: "Super Mario Odyssey",
    released: "2017-10-27",
    rating: 4.7,
    ratings_count: 2200,
    tags: ["singleplayer"],
  },
  {
    id: -27,
    name: "Animal Crossing: New Horizons",
    released: "2020-03-20",
    rating: 4.4,
    ratings_count: 2100,
    tags: ["singleplayer", "multiplayer"],
  },
  {
    id: -28,
    name: "Final Fantasy VII Remake",
    released: "2020-04-10",
    rating: 4.5,
    ratings_count: 2000,
    tags: ["singleplayer"],
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1462040/header.jpg",
  },
  {
    id: -29,
    name: "Genshin Impact",
    released: "2020-09-28",
    rating: 4.1,
    ratings_count: 2800,
    tags: ["multiplayer"],
  },
  {
    id: -30,
    name: "Destiny 2",
    released: "2017-09-06",
    rating: 4.0,
    ratings_count: 2600,
    tags: ["multiplayer"],
    image:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1085660/header.jpg",
  },
];

function buildTags(tags: FallbackTag[]) {
  return tags.map((tag, index) => ({
    id: TAGS[tag].id + index,
    name: TAGS[tag].name,
    slug: TAGS[tag].slug,
    language: "eng",
    games_count: 0,
    image_background: "",
  }));
}

export function toFallbackResult(seed: FallbackSeed): Results {
  const tagList = buildTags(seed.tags);
  const imageUrl = seed.image ?? FALLBACK_IMAGE;

  return {
    slug: seed.name.toLowerCase().replace(/\s+/g, "-"),
    name: seed.name,
    playtime: 0,
    platforms: [],
    stores: [],
    released: seed.released,
    tba: "false",
    background_image: imageUrl,
    rating: new Double(seed.rating),
    rating_top: 5,
    ratings: [],
    ratings_count: seed.ratings_count,
    reviews_text_count: 0,
    added: 0,
    added_by_status: {
      yet: 0,
      owned: 0,
      beaten: 0,
      toplay: 0,
      dropped: 0,
      playing: 0,
    },
    metacritic: 0,
    suggestions_count: 0,
    updated: new Date().toISOString(),
    id: seed.id,
    score: null,
    clip: null,
    tags: tagList,
    esrb_rating: {
      id: 1,
      name: "Everyone",
      slug: "everyone",
      name_en: "Everyone",
      name_ru: "Everyone",
    },
    user_game: null,
    reviews_count: 0,
    saturated_color: "#0f172a",
    dominant_color: "#0f172a",
    short_screenshots: [],
    parent_platforms: [],
    genres: [DEFAULT_GENRE],
  };
}

export function toFallbackGame(seed: FallbackSeed): Game {
  const imageUrl = seed.image ?? FALLBACK_IMAGE;
  return {
    id: seed.id,
    slug: seed.name.toLowerCase().replace(/\s+/g, "-"),
    name: seed.name,
    name_original: seed.name,
    description: "",
    metacritic: null,
    metacritic_platforms: [],
    released: seed.released,
    tba: false,
    updated: new Date().toISOString(),
    background_image: imageUrl,
    background_image_additional: null,
    website: "",
    rating: new Double(seed.rating),
    rating_top: 5,
    ratings: [],
    reactions: null,
    added: 0,
    added_by_status: {
      yet: 0,
      owned: 0,
      beaten: 0,
      toplay: 0,
      dropped: 0,
      playing: 0,
    },
    playtime: 0,
    screenshots_count: 0,
    movies_count: 0,
    creators_count: 0,
    achievements_count: 0,
    parent_achievements_count: 0,
    reddit_url: "",
    reddit_name: "",
    reddit_description: "",
    reddit_logo: "",
    reddit_count: 0,
    twitch_count: 0,
    youtube_count: 0,
    reviews_text_count: 0,
    ratings_count: seed.ratings_count,
    suggestions_count: 0,
    alternative_names: [],
    metacritic_url: "",
    parents_count: 0,
    additions_count: 0,
    game_series_count: 0,
    user_game: null,
    reviews_count: 0,
    community_rating: seed.rating,
    saturated_color: "#0f172a",
    dominant_color: "#0f172a",
    parent_platforms: [],
    platforms: [],
    stores: [],
    developers: [],
    genres: [DEFAULT_GENRE],
    tags: [],
    publishers: [],
    esrb_rating: null,
    clip: null,
    description_raw:
      "Fallback data: details are limited because the RAWG API was unavailable.",
  };
}

export function getFallbackGameById(id: number): Game | null {
  const seed = fallbackSeeds.find((item) => item.id === id);
  if (!seed) return null;
  return toFallbackGame(seed);
}
