import { ApolloServer } from '@apollo/server';
import { expressMiddleware as apolloMiddleware } from '@apollo/server/express4'
import cors from 'cors';
import express from 'express';
import { readFile } from 'node:fs/promises';
import { resolvers } from './resolvers.js';
import { authMiddleware, handleLogin } from './auth.js';
import { getUser } from './db/users.js';
import { createCompanyLoader } from './db/companies.js';

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
// When we want to pass extra values into the GraphQL resolvers, then we can use the context property
app.use('/graphql', apolloMiddleware(apolloServer, { context: getContext }))

app.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
});

// The middleware injects a couple of values in here, one of them being the request
async function getContext({ req }) {
  const companyLoader = createCompanyLoader();
  const context = { companyLoader };

  // auth is accessible because of the auth middleware. It's a decoded JWT.
  if (req.auth) {
    const userId = req.auth.sub;
    context.user = await getUser(userId);
  }

  return context;
}