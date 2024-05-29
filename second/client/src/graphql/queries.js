import { GraphQLClient, gql } from 'graphql-request';
import { getAccessToken } from '../lib/auth';

const client = new GraphQLClient('http://localhost:9000/graphql', {
    headers: () => {
        const accessToken = getAccessToken();

        if (accessToken) {
            return {
                'Authorization': `Bearer ${accessToken}`
            };
        }

        return {};
    }
});

export async function updateJob(id, { title, description }) {
    const update = gql`
        mutation UpdateJob($input: UpdateJobInput!) {
            job: updateJob(input: $input) {
                id
            }
        }
    `;

    const data = await client.request(update, { id, title, description });

    return data.job;
}

export async function deleteJob(id) {
    const deletion = gql`
        mutation DeleteJob($id: ID!) {
            job: deleteJob(id: $id) {
                id
            }
        }
    `;

    const data = await client.request(deletion, { id });

    return data.job;
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

    const data = await client.request(mutation, { input: { title, description } });

    return data.job;
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

