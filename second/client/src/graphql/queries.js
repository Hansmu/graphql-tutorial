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

// To avoid duplicating code, then we can use fragments

const jobDetailFragment = gql`
    # First we give it a name "JobDetail", then we say on which object it applies
    fragment JobDetail on Job {
        id
        date
        title
        company {
            id
            name      
        }
        description
    }
`;

// You can also name your query, by adding a name after the `query` keyword
const jobByIdQuery = gql`
# To provide variables using GQL's own mechanisms, you can define them in the query bit
# You can use string interpolation as well, but that comes with all sorts of annoyances
query JobById($idVariableRightHereToUse: ID!) {
    job(id: $idVariableRightHereToUse) {
        # Basically like the destructuring syntax from Javascript
        ...JobDetail
    }
}    
# We just add the code as string interpolation, nothing fancy
${jobDetailFragment}  
`;

export async function createJob({ title, description }) {
    const mutation = gql`
        mutation CreateJob($input: CreateJobInput!) {
            # You can add aliases to the return values
            # Without the "job" alias here the return for this call would be createJob
            # { "data": { "createJob": { "id": "asdsa" } }
            # However, when you alias it, you get
            # { "data": { "job": { "id": "asdsa" } }
            job: createJob(input: $input) {
                # Currently, when we're creating a job, we'd be querying for the job by ID right after creating it
                # However, we could just return the entire object from the same create request
                ...JobDetail
            }
        }
        ${jobDetailFragment}
    `;

    const result = await apolloClient.mutate({
        mutation,
        variables: {
            input: {
                title,
                description
            }
        },
        // In order to tell the cache that the data for a job by ID is available, we can manually manipulate the response after a mutation has been posted
        // We need to add it to the cache with the same exact structure as a get by ID would be
        update: (cache, { data }) => {
            cache.writeQuery({
                // Need to tell the query what query it would be matching
                query: jobByIdQuery,
                // Since it also uses variables to track, then we need to add those
                variables: {
                    // Get the ID from the response data
                    id: data.job.id
                },
                // Finally, we define the actual data
                data,
            })
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
    // Here we can then pass the variables as the second parameter
    const result = await apolloClient.query({
        query: jobByIdQuery,
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

