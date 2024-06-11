import { ApolloServer } from '@apollo/server';
import { expressMiddleware as apolloMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import { readFile } from 'node:fs/promises';
// This method is used to create a HTTP server
import { createServer as createHttpServer } from 'node:http';
import { authMiddleware, decodeToken, handleLogin } from './auth.js';
import { resolvers } from './resolvers.js';
// This is needed to use WebSockets, as it's a separate protocol, then this is an implementation of it
import { WebSocketServer } from 'ws';
// This is needed to enable subscriptions over WebSockets for GraphQL
import { useServer as useWsServer } from 'graphql-ws/lib/use/ws';
// To create an executable schema
import { makeExecutableSchema } from '@graphql-tools/schema';

const PORT = 9000;

// Note that Express itself is not an HTTP server by default
// When you call app.listen(...) then a HTTP server is created behind the scenes
// This server isn't exposed to the us, however, so we need to do it through a `createServer` function, which does create a HTTP server we can interact with
const app = express();
app.use(cors(), express.json());

app.post('/login', handleLogin);

function getHttpContext({ req }) {
  if (req.auth) {
    return { user: req.auth.sub };
  }
  return {};
}

function getWsContext({ connectionParams }) {
  const accessToken = connectionParams?.accessToken;

  if (accessToken) {
    const payload = decodeToken(accessToken);
    return { user: payload.sub };
  }

  return {};
}

// First off, we're going to need a HTTP server, which we'll combine with our Express app
const httpServer = createHttpServer(app);

// Secondly, we're going to setup a WebSocketServer with the HTTP client, WS connections are opened up with a HTTP request
const wsServer = new WebSocketServer({
  // The server that you provide to this has to be an HTTP server, as the connection is started by making a special HTTP request
  // WS depends on HTTP
  server: httpServer,
  path: '/graphql'
});

// Third, we're going to need a schema for GraphQL
const typeDefs = await readFile('./schema.graphql', 'utf8');
// By default, when you pass typeDefs and resolvers into the ApolloServer, then it'll automatically create a schema
// WS server does not have that option, so we need to build the schema manually
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

// Schema can then be passed into the ApolloServer as well, instead of the typeDefs and resolvers
const apolloServer = new ApolloServer({ schema });
await apolloServer.start();
app.use('/graphql', authMiddleware, apolloMiddleware(apolloServer, {
  context: getHttpContext,
}));

// Fourth, you need to integrate the schema with the web socket server
// This is the one that'll manage the GraphQL subscriptions
useWsServer({ schema, context: getWsContext }, wsServer);

// Finally, the configurations are done, we boot up the HTTP server
httpServer.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
});
