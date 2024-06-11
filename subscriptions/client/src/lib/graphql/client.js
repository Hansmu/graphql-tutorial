import { ApolloClient, ApolloLink, concat, createHttpLink, InMemoryCache, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { Kind, OperationTypeNode } from 'graphql';
import { createClient as createWsClient } from 'graphql-ws';
import { getAccessToken } from '../auth';

const httpLink = concat(authLink, createHttpLink({
  uri: 'http://localhost:9000/graphql'
}));

// Able to process GraphQL over Websocket
const wsLink = new GraphQLWsLink(createWsClient({
  url: 'ws://localhost:9000/graphql',
  connectionParams: () => ({ accessToken: getAccessToken() }),
}));

const authLink = new ApolloLink((operation, forward) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    operation.setContext({
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
  }
  return forward(operation);
});

export const apolloClient = new ApolloClient({
  // Since WebSockets require a bit of a different way of handling it, then we split the traffic
  // If it's a subscription, then it's a websocket and has to be handled by the WS Link
  link: split(isSubscription, wsLink, httpLink),
  cache: new InMemoryCache(),
});

function isSubscription(operation) {
  const definition = getMainDefinition(operation.query);
  return definition.kind === Kind.OPERATION_DEFINITION
    && definition.operation === OperationTypeNode.SUBSCRIPTION;
}