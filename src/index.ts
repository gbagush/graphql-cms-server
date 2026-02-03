import cors from "cors";
import express from "express";
import http from "http";

import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@as-integrations/express5";
import { env } from "./configs/env";
import { AppDataSource } from "./lib/datasource";
import { buildSchema } from "type-graphql";
import { SetupResolver } from "./graphql/resolvers/SetupResolver";
import { AuthResolver } from "./graphql/resolvers/AuthResolver";

import { authChecker } from "./graphql/auth/authChecker";
import type { Context } from "./graphql/types/Context";
import { authMiddleware } from "./middlewares/AuthMiddleware";
import { CategoryResolver } from "./graphql/resolvers/CategoryResolver";
import { TagResolver } from "./graphql/resolvers/TagResolver";
import { PostResolver } from "./graphql/resolvers/PostResolver";

async function main() {
  await AppDataSource.initialize();
  console.log("📦 Database connected");

  const app = express();
  const httpServer = http.createServer(app);

  app.use(
    cors({
      origin: "*",
      credentials: true,
    }),
  );

  const schema = await buildSchema({
    resolvers: [
      SetupResolver,
      AuthResolver,
      CategoryResolver,
      TagResolver,
      PostResolver,
    ],
    authChecker,
  });

  const server = new ApolloServer<Context>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: authMiddleware,
    }),
  );

  app.listen(env.APP.PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${env.APP.PORT}/graphql`);
  });
}

main();
