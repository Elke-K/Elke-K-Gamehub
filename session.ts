import { MONGODB_URI } from "./database";
import session, { MemoryStore } from "express-session";
import { Users } from "./types";
import MongoStore from 'connect-mongo'

if(!process.env.SESSION_SECRET){
    throw new Error("SESSION_SECRET not defined in .env!");
}

const mongoStore = MongoStore.create({
    mongoUrl: MONGODB_URI,
    dbName: "sessions",
    collectionName: "login-express"   
});

mongoStore.on("error", (error) => {
    console.error(error);
});

declare module 'express-session' {
    export interface SessionData {
        user?: Users
    }
}

export default session({
    secret: process.env.SESSION_SECRET,
    store: mongoStore,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
});

declare module "express-session" {
  interface SessionData {
    user?: Users;
    notification: string;
  }
}