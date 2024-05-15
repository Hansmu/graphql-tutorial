import { GraphQLClient, gql } from 'graphql-request';

const client = new GraphQLClient('http://localhost:9000/graphql');

export async function getJobs() {
    // gql is a convenience method to get syntax highlighting in your IDE
    const query = qgl`
        query {
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

    const data = await client.request(query);
    return data.jobs;
}

