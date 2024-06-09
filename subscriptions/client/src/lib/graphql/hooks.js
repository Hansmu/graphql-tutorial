import { useMutation, useQuery } from '@apollo/client';
import { addMessageMutation, messagesQuery } from './queries';

export function useAddMessage() {
  const [mutate] = useMutation(addMessageMutation);

  const addMessage = async (text) => {
    // So when we're using ApolloClient, by default things go into the cache
    // We start the page off with a useQuery, which gets the messages that currently exists
    // If we post a new message, we want to have it show up instantly
    // For that we could send a new query or simply update the cache with the returned object of our mutation query
    const { data: { message } } = await mutate({
      variables: { text },
      update: (cache, { data }) => {
        const newMessage = data.message;
        cache.updateQuery({ query: messagesQuery }, ({ messages }) => {
          return { messages: [...messages, newMessage] };
        });
      },
    });
    return message;
  };

  return { addMessage };
}

export function useMessages() {
  const { data } = useQuery(messagesQuery);
  return {
    messages: data?.messages ?? [],
  };
}
