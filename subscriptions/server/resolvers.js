import { GraphQLError } from 'graphql';
import { createMessage, getMessages } from './db/messages.js';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

export const resolvers = {
  Query: {
    messages: (_root, _args, { user }) => {
      if (!user) throw unauthorizedError();
      return getMessages();
    },
  },

  Mutation: {
    addMessage: async (_root, { text }, { user }) => {
      if (!user) throw unauthorizedError();
      
      const message = await createMessage(user, text);
      pubSub.publish(
        'MESSAGE_ADDED',
        {
          // The property needs to match the subscription name
          messageAdded: message
        }
      );
      return message;
    },
  },
  Subscription: {
    messageAdded: {
      // Since subscriptions happen constantly, then it has a bit of a different signature
      // It has a subscribe method which is an async iterable
      // To simplify the implementation, we can use the `graphql-subscriptions` library
      subscribe: (_root, _args, { user }) => {
        if (!user) {
          throw unauthorizedError();
        }

        return pubSub.asyncIterator('MESSAGE_ADDED');
      },
    }
  }
};

function unauthorizedError() {
  return new GraphQLError('Not authenticated', {
    extensions: { code: 'UNAUTHORIZED' },
  });
}
