import { ApolloClient, InMemoryCache, concat, gql, createHttpLink, ApolloLink } from '@apollo/client';
import { GraphQLClient } from 'graphql-request';
import { getAccessToken } from '../lib/auth';

// const client = new GraphQLClient('http://localhost:9000/graphql', {
//     headers: () => {
//         const accessToken = getAccessToken();

//         if (accessToken) {
//             return {
//                 'Authorization': `Bearer ${accessToken}`
//             };
//         }

//         return {};
//     }
// });

// When the ApolloClient had only the URI defined, then it was creating an httpLink automatically
// When using the ApolloClient, you have have one or the other defined - URI/link, but not both
const httpLink = createHttpLink({
    uri: 'http://localhost:9000/graphql'
});

// Kind of similar to middlewares. You add links to a chain, perform operations and forward as needed.
const authLink = new ApolloLink((operation, forward) => {
    const accessToken = getAccessToken();

    if (accessToken) {
        operation.setContext({
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
    }

    return forward(operation);
})

const apolloClient = new ApolloClient({
    link: concat(authLink, httpLink),
    // When we use the ApolloClient, then there is a cache
    // This means that whenever you make a request that has already been made, then Apollo reaches into the cache to get the result
    // Since the current one is in memory, then it'll live only as long as the user hasn't refreshed
    // To see into the cache, you can use Apollo Devtools
    // You'll see that the cache is a flat structure
    // There will also be references. It builds its own key with the object type prefix attached to an id or _id field.
    cache: new InMemoryCache(),
    // An override for where to get data can be provided either in the specific queries/mutations or on the client itself
    // defaultOptions: {
    //     // Generally, when you're defining it for query, you'll also want to use the same policy for watchQuery
    //     query: {
    //         fetchPolicy: 'network-only'
    //     },
    //     watchQuery: {
    //         fetchPolicy: 'network-only'
    //     }
    // } 
});

export async function updateJob(id, { title, description }) {
    const update = gql`
        mutation UpdateJob($input: UpdateJobInput!) {
            job: updateJob(input: $input) {
                id
            }
        }
    `;

    const result = await apolloClient.mutate({
        update,
        variables: { id, title, description }
    })

    return result.data.job;
}

export async function deleteJob(id) {
    const deletion = gql`
        mutation DeleteJob($id: ID!) {
            job: deleteJob(id: $id) {
                id
            }
        }
    `;

    const result = await apolloClient.mutate({
        deletion,
        variables: {
            id
        }    
    })

    return result.data.job;
}

export async function createJob({ title, description }) {
    const mutation = gql`
        mutation CreateJob($input: CreateJobInput!) {
            # You can add aliases to the return values
            # Without the "job" alias here the return for this call would be createJob
            # { "data": { "createJob": { "id": "asdsa" } }
            # However, when you alias it, you get
            # { "data": { "job": { "id": "asdsa" } }
            job: createJob(input: $input) {
                id
            }
        }
    `;

    const result = await apolloClient.mutate({
        mutation,
        variables: {
            input: {
                title,
                description
            }
        }    
    })

    return result.data.job;
}

export async function getCompany(id) {
    const query = gql`
        query CompanyById($idVariableRightHereToUse: ID!) {
            company(id: $idVariableRightHereToUse) {
                id
                name
                description
                jobs {
                    id
                    date
                    title
                }
            }
        }      
    `;

    // Here we can then pass the variables as the second parameter
    const result = await apolloClient.query({
        query,
        variables: {
            idVariableRightHereToUse: id
        }
    });
    return result.data.company;
}

export async function getJob(id) {
    // You can also name your query, by adding a name after the `query` keyword
    const query = gql`
        # To provide variables using GQL's own mechanisms, you can define them in the query bit
        # You can use string interpolation as well, but that comes with all sorts of annoyances
        query JobById($idVariableRightHereToUse: ID!) {
            job(id: $idVariableRightHereToUse) {
                id
                date
                title
                company {
                    id
                    name      
                }
                description
            }
        }      
    `;

    // Here we can then pass the variables as the second parameter
    const result = await apolloClient.query({
        query,
        variables: {
            idVariableRightHereToUse: id
        }
    });
    return result.data.job;
}

export async function getJobs() {
    // gql is a convenience method to get syntax highlighting in your IDE
    const query = gql`
        query Jobs {
            jobs {
                id
                date
                title
                company {
                    id
                    name      
                }
            }
        }      
    `;

    const result = await apolloClient.query({
        query,
        // The default behaviour for requests is to use 'cache-first', which means it first looks into the cache, if it's not there, then query
        // If we want to change it, we can use the fetchPolicy property
        // 'network-only' would only get fresh data, never using the cache
        fetchPolicy: 'network-only'
    });
    return result.data.jobs;
}

