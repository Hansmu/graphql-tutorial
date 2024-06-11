import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { addMessageMutation, messageAddedSubscription, messagesQuery } from './queries';

export function useAddMessage() {
  const [mutate] = useMutation(addMessageMutation);

  const addMessage = async (text) => {
    // So when we're using ApolloClient, by default things go into the cache
    // We start the page off with a useQuery, which gets the messages that currently exists
    // If we post a new message, we want to have it show up instantly
    // For that we could send a new query or simply update the cache with the returned object of our mutation query
    const { data: { message } } = await mutate({
      variables: { text },
    });
    return message;
  };

  return { addMessage };
}

export function useMessages() {
  const { data } = useQuery(messagesQuery);

  useSubscription(messageAddedSubscription, {
    onData: ({ client, data }) => {
      const newMessage = data.data.message;
      client.cache.updateQuery({ query: messagesQuery }, ({ messages }) => {
        return { messages: [...messages, newMessage] };
      });
    },
  });

  return {
    messages: data?.messages ?? [],
  };
}
