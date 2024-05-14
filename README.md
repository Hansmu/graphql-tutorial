# GraphQL tutorial

GraphQL is an alternative to REST. It allows you to control what data you fetch with a request, whereas in REST, it's predefined.

You can request as little or as much as you want. You can get multiple resources or a single file for a single resource.

GraphQL also provides a schema for the data.

Now GraphQL itself is only a specification, to use it, you need an implementation.

One popular implementation of GraphQL is Apollo.

## Definition intro

In the most basic form you have:
* A type definition - describes the schema
  * When you're adding type definitions, then a `type Query` definition must always be present (if you're using defaults), as that is the entry point for GraphQL
* A resolver - says how to get the data for the schema

In terms of having the `type Query`, you can also override it by providing:
```js
schema {
    query: WhateverNameYouWant
}
```

A more concrete example would be:
```js
const typeDefs = `
    schema {
        query: BananaBread
    }
    type BananaBread {
        greeting: String
    }
`;

const resolvers = {
    BananaBread: {
        greeting: () => 'Hello world'
    }
};
```

## Query intro

By default, GraphQL requests are sent as POST requests.

When querying the data, then the return object has a shape of:
```js

{
    "data": { // Contains the data from your query
        ...
    },
    "errors": [ // Contains the errors if there were any
        ...
    ]
}
```

When writing a query, you can preceed it with a `query` keyword or just omit it, so the following examples are the same:
```js
{
    greeting
}

query {
    greeting
}
```

When looking at the body, then you can see a string:
```js
{"query":"query {\n  greeting\n}\n","variables":{}}
```

So the query that you write will get turned into a string and sent to the server.