import { ApolloServer } from '@apollo/server';
import { expressMiddleware as apolloMiddleware } from '@apollo/server/express4'
import cors from 'cors';
import express from 'express';
import { readFile } from 'node:fs/promises';
import { resolvers } from './resolvers.js';
import { authMiddleware, handleLogin } from './auth.js';

const PORT = 9000;

const app = express();
app.use(cors(), express.json(), authMiddleware);


const typeDefs = await readFile('./schema.graphql', 'utf8')
// In order to use Apollo in Express, you need:
//  1. A new ApolloServer
//  2. Starting the server
//  3. Adding an Apollo middleware
const apolloServer = new ApolloServer({ typeDefs, resolvers });
await apolloServer.start();

app.post('/login', handleLogin);
app.use('/graphql', apolloMiddleware(apolloServer))

app.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
});
