import { Collection, MongoClient, ObjectId } from "mongodb";
import { Users, GamesApi, Collection_more, Results } from "./types";
import { configDotenv } from "dotenv";
import { fallbackSeeds, toFallbackResult } from "./cache/fallbackGames";

configDotenv();

if (!process.env.MONGODB) {
  console.error("Mongo string not defined!");
  process.exit(1);
}

export const MONGODB_URI: string = process.env.MONGODB;

let gamesOfApi: GamesApi;
export let counter = 1;

const url: string = `https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&dates=1969-01-01,2026-04-11`;
const client: MongoClient = new MongoClient(process.env.MONGODB);
let userCollection: Collection<Users> = client
  .db("users")
  .collection("userinfo");
type FallbackGameDoc = Results & { _id?: ObjectId };
const fallbackGamesCollection: Collection<FallbackGameDoc> = client
  .db("games")
  .collection("fallback_games");

export async function exit() {
  try {
    await client.close();
    console.log("Database closed!");
    process.exit(0);
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

export async function connect() {
  try {
    await client.connect();
    console.log("Database successfully connected!");
    process.on("SIGINT", exit);
    process.on("SIGUSR2", exit);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export async function seedFallbackGamesIfEmpty() {
  const docs = fallbackSeeds.map((seed) => toFallbackResult(seed));
  if (docs.length === 0) return;

  const ops = docs.map((doc) => ({
    updateOne: {
      filter: { id: doc.id },
      update: { $set: doc },
      upsert: true,
    },
  }));

  await fallbackGamesCollection.bulkWrite(ops);
}

export async function getFallbackGames(): Promise<Results[]> {
  const docs = await fallbackGamesCollection.find().toArray();
  return docs.map(({ _id, ...rest }) => rest);
}

export async function addToCollection(
  userId: string,
  collection: Collection_more,
) {
  const user: Users | null = await userCollection.findOne<Users>({
    _id: new ObjectId(userId),
  });

  if (user === null) return;

  let found = false;

  for (let coll of user.collection_more) {
    if (coll.collectionName === collection.collectionName) {
      found = true;

      await userCollection.updateOne(
        {
          _id: new ObjectId(userId),
          "collection_more.collectionName": collection.collectionName,
        },
        {
          $push: {
            "collection_more.$.allGames": collection.allGames[0], // or a single game object
          },
        },
      );
    }
  }

  if (!found) {
    await userCollection.updateOne(
      {
        _id: new ObjectId(userId),
      },
      {
        $push: {
          collection_more: collection,
        },
      },
    );
  }
}

export async function deleteAllGames(userId: string, collectionName: string) {
  const user = await userCollection.findOne<Users>({
    _id: new ObjectId(userId),
  });

  if (user === null) {
    console.log("User not found:", userId);
    return;
  }

  const result = await userCollection.updateOne(
    {
      _id: new ObjectId(userId),
      "collection_more.collectionName": collectionName,
    },
    { $set: { "collection_more.$.allGames": [] } },
  );
}

export async function getAllCollectionsAndGamesOfCollections(userId: string) {
  const user: Users | null = await userCollection.findOne<Users>({
    _id: new ObjectId(userId),
  });

  if (user === null) return;

  return user;
}

export async function getUserById(userId: string) {
  const user: Users | null = await userCollection.findOne<Users>({
    _id: new ObjectId(userId),
  });

  if (user === null) return;

  return user;
}

export async function deleteCollection(userId: string, name: string) {
  await userCollection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $pull: { collection_more: { collectionName: name } },
    },
  );

  console.log("collection was deleted successfully");
}

export async function deleteGameFromCollection(
  userId: string,
  name: string,
  gameId: string,
) {
  await userCollection.updateOne(
    { _id: new ObjectId(userId), "collection_more.collectionName": name },
    {
      $pull: { "collection_more.$.allGames": { gameId: gameId } },
    },
  );

  console.log("collection was deleted successfully");
}

export function loginUser() {}

export async function registerUser(newUser: Users) {
  await userCollection.insertOne(newUser);
}

export async function checkIfUserExists(
  email: string,
  username: string,
): Promise<boolean> {
  let allUsers: Users[] = await userCollection.find().toArray();
  return allUsers.some(
    (u) =>
      u.email.toLowerCase() === email || u.username.toLowerCase() === username,
  );
}

export async function getUser(emailOrUsername: string) {
  const allUsers: Users[] = await userCollection.find().toArray();

  const currentUser: Users | undefined = allUsers.find(
    (u) =>
      u.username.toLowerCase() === emailOrUsername ||
      u.email.toLowerCase() === emailOrUsername,
  );

  return currentUser;
}

export async function getAllUsers() {
  const allUsers: Users[] = await userCollection.find().toArray();
  return allUsers;
}

export async function updateUser(user: Users) {
  if (
    (await userCollection.findOne({
      email: user.email,
      _id: { $ne: new ObjectId(user._id) },
    })) ||
    (await userCollection.findOne({
      username: user.username,
      _id: { $ne: new ObjectId(user._id) },
    }))
  ) {
    console.log("alr");
    return "Deze email of gebruikersnaam bestaat al!";
  }

  const updateUser = await userCollection.updateOne(
    { _id: new ObjectId(user._id) },
    {
      $set: {
        username: user.username,
        about_me: user.about_me,
        email: user.email,
        public_profile: user.public_profile,
      },
    },
  );

  return "Gebruiker successvol veranderd!";
}

export async function updateProfileStatus(userId: string, status: boolean) {
  await userCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { public_profile: status } },
  );
}

export async function updateUserPicture(user: Users, image: string) {
  await userCollection.updateOne(
    { _id: new ObjectId(user._id) },
    { $set: { profile_picture: image } },
  );
  return "Profiel foto successvol veranderd!";
}

export async function getRecentUserInfo(userId: string): Promise<Users | null> {
  return userCollection.findOne({ _id: new ObjectId(userId) });
}

//////////////

export async function getGames() {
  gamesOfApi = await fetch(`${url}`).then((res) => res.json());
  return gamesOfApi;
}

export function increaseCounter() {
  counter += 1;
}

export function decreaseCounter() {
  counter -= 1;
}

export async function getRecentGameswithPageSize() {
  gamesOfApi = await fetch(
    `${url}&ordering=-released&page=${counter}&page_size=20`,
  ).then((res) => res.json());
  return gamesOfApi;
}

export async function getOrderdGamesByReleaseYearAsc() {
  gamesOfApi = await fetch(
    `${url}&ordering=released&page=${counter}&page_size=20`,
  ).then((res) => res.json());
  return gamesOfApi;
}

export async function getOrderdGamesByNameDes() {
  gamesOfApi = await fetch(
    `${url}&ordering=-name&page=${counter}&page_size=20`,
  ).then((res) => res.json());
  return gamesOfApi;
}

export async function getOrderdGamesByNameAsc() {
  gamesOfApi = await fetch(
    `${url}&ordering=name&page=${counter}&page_size=20`,
  ).then((res) => res.json());
  return gamesOfApi;
}

export async function getOrderdGamesByRatingDes() {
  gamesOfApi = await fetch(
    `${url}&ordering=-rating&page=${counter}&page_size=20`,
  ).then((res) => res.json());
  return gamesOfApi;
}

export async function getOrderdGamesByRatingAsc() {
  gamesOfApi = await fetch(
    `${url}&ordering=rating&page=${counter}&page_size=20`,
  ).then((res) => res.json());
  return gamesOfApi;
}

export async function getOrderdGamesBySingleplayer() {
  gamesOfApi = await fetch(
    `${url}&ordering=singleplayer&page=${counter}&page_size=20`,
  ).then((res) => res.json());
  return gamesOfApi;
}

export async function getOrderdGamesByMultiplayer() {
  gamesOfApi = await fetch(
    `${url}&ordering=multiplayer&page=${counter}&page_size=20`,
  ).then((res) => res.json());
  return gamesOfApi;
}

export async function searchGame(searchedGame: string) {
  gamesOfApi = await fetch(`${url}&search=${searchedGame}`).then((res) =>
    res.json(),
  );
  return gamesOfApi;
}

export async function getRecentGames() {
  gamesOfApi = await fetch(`${url}&ordering=-released`).then((res) =>
    res.json(),
  );
  return gamesOfApi;
}

export async function addReview(
  reviewtxt: string,
  reviewrating: number,
  gameId: string,
  userId: string,
) {
  await userCollection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $push: {
        reviews: {
          userId: userId,
          gameId: gameId,
          review: reviewtxt,
          rating: reviewrating,
        },
      },
    },
  );
}

export async function createPasswordResetToken(
  userId: string,
  token: string,
  expiresAt: Date,
) {
  const db = client.db("users");

  await db.collection("password_resets").insertOne({
    userId,
    token,
    expiresAt,
  });
}

export async function getPasswordResetToken(token: string) {
  const db = client.db("users");

  return await db.collection("password_resets").findOne({
    token,
    expiresAt: {
      $gt: new Date(),
    },
  });
}

export async function deletePasswordResetToken(token: string) {
  const db = client.db("users");

  await db.collection("password_resets").deleteOne({
    token,
  });
}

export async function updatePassword(userId: string, hashedPassword: string) {
  await userCollection.updateOne(
    {
      _id: new ObjectId(userId),
    },
    {
      $set: {
        password: hashedPassword,
      },
    },
  );
}

export async function getUserCollections(userId: string) {
  const user: Users | null = await userCollection.findOne<Users>({
    _id: new ObjectId(userId),
  });

  if (!user) {
    return [];
  }

  return user.collection_more || [];
}
