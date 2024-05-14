// Apollo server is an implementation of a GraphQL server
// GraphQL itself is a specification, and Apollo is one implementation of that spec
import { ApolloServer } from '@apollo/server';
// The startStandaloneServer is to start Apollo on its own
// Otherwise you'd use something like Express and then define Apollo definitions in there
import { startStandaloneServer } from '@apollo/server/standalone';

// The first bit with GraphQL is to add your type definition
const typeDefs = `
    # Bars can be used to comment code inside of GraphQL templates
    # The template starts off with a type definition
    # type Query is a required bit of definition - it defines the entry point for the reads
    type Query {
        # Inside the body, you'll add field names followed by their types
        greeting: String
    }
`;

// Next, you're going to be adding a resolver, which actually tells GraphQL how to get the values
// You add functions and these can get data however way you need
const resolvers = {
    Query: {
        greeting: () => 'Hello world'
    }
};

const server = new ApolloServer({ typeDefs, resolvers });

const info = await startStandaloneServer(server, { listen: { port: 9000 } });
console.log(`Server running at ${info.url}`);