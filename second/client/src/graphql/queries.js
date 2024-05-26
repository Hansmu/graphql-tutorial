import { GraphQLClient, gql } from 'graphql-request';

const client = new GraphQLClient('http://localhost:9000/graphql');

export async function getCompany(id) {
    const query = gql`
        query CompanyById($idVariableRightHereToUse: ID!) {
            company(id: $idVariableRightHereToUse) {
                id
                name
                description
            }
        }      
    `;

    // Here we can then pass the variables as the second parameter
    const data = await client.request(query, { idVariableRightHereToUse: id });
    return data.company;
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
    const data = await client.request(query, { idVariableRightHereToUse: id });
    return data.job;
}

export async function getJobs() {
    // gql is a convenience method to get syntax highlighting in your IDE
    const query = gql`
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

