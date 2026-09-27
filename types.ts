import { Double, ObjectId } from "mongodb";

export interface Users {
  _id?: ObjectId;
  email: string;
  username: string;
  password?: string;
  level: number;
  about_me: string;
  profile_picture: string;
  public_profile: boolean;
  collection_more: Collection_more[];
  reviews: user_reviews[];
}

export interface user_reviews {
  userId: string;
  gameId: string;
  review: string;
  rating: number;
}

export interface Collection_more {
  collectionName: string;
  allGames: AllGames[];
}

interface AllGames {
  gameId: string;
  gameName: string;
  gameImge: string;
}

export interface GamesApi {
  count: number;
  next: string;
  previous: null;
  results: Results[];
  user_platforms: false;
}

export interface Results {
  slug: string;
  name: string;
  playtime: number;
  platforms: Platforms[];
  stores: Stores[];
  released: string;
  tba: string;
  background_image: string;
  rating: Double;
  rating_top: number;
  ratings: Ratings[];
  ratings_count: number;
  reviews_text_count: number;
  added: number;
  added_by_status: Added_by_status;
  metacritic: number;
  suggestions_count: number;
  updated: string;
  id: number;
  score: null;
  clip: null;
  tags: Tags[];
  esrb_rating: Esrb_rating;
  user_game: null;
  reviews_count: number;
  saturated_color: string;
  dominant_color: string;
  short_screenshots: Short_screenshots[];
  parent_platforms: Platforms[];
  genres: Genres[];
}

interface Platforms {
  platform: Platform;
}

interface Platform {
  id: number;
  name: string;
  slug: string;
}

interface Stores {
  store: Store;
}

interface Store {
  id: number;
  name: string;
  slug: string;
}

interface Ratings {
  id: number;
  title: string;
  count: number;
  percent: Double;
}

interface Added_by_status {
  yet: number;
  owned: number;
  beaten: number;
  toplay: number;
  dropped: number;
  playing: number;
}

interface Tags {
  id: number;
  name: string;
  slug: string;
  language: string;
  games_count: number;
  image_background: string;
}

interface Esrb_rating {
  id: number;
  name: string;
  slug: string;
  name_en: string;
  name_ru: string;
}

interface Short_screenshots {
  id: number;
  image: string;
}

interface Genres {
  id: number;
  name: string;
  slug: string;
}

export interface Game {
  id: number;
  slug: string;
  name: string;
  name_original: string;
  description: string;
  metacritic: null;
  metacritic_platforms: [];
  released: string;
  tba: boolean;
  updated: string;
  background_image: string | null;
  background_image_additional: null;
  website: string;
  rating: Double;
  rating_top: number;
  ratings: [];
  reactions: null;
  added: number;
  added_by_status: Added_by_status;
  playtime: number;
  screenshots_count: number;
  movies_count: number;
  creators_count: number;
  achievements_count: number;
  parent_achievements_count: number;
  reddit_url: string;
  reddit_name: string;
  reddit_description: string;
  reddit_logo: string;
  reddit_count: number;
  twitch_count: number;
  youtube_count: number;
  reviews_text_count: number;
  ratings_count: number;
  suggestions_count: number;
  alternative_names: [];
  metacritic_url: string;
  parents_count: number;
  additions_count: number;
  game_series_count: number;
  user_game: null;
  reviews_count: number;
  community_rating: number;
  saturated_color: string;
  dominant_color: string;
  parent_platforms: [];
  platforms: [];
  stores: [];
  developers: [];
  genres: Genres1[];
  tags: [];
  publishers: [];
  esrb_rating: null;
  clip: null;
  description_raw: string;
}

interface Added_by_status {
  yet: number;
  toplay: number;
}

interface Genres1 {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string;
}
