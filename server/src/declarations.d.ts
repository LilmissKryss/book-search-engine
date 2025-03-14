import { Application } from "express";
import { Application as ApolloApplication } from "apollo-server-express/node_modules/@types/express";

declare global {
  interface ApplicationBridge extends Application, ApolloApplication {}
}
