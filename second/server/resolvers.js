import { getJobs } from './db/jobs.js';

export const resolvers = {
    Query: {
        jobs: getJobs
    },
    // We can define custom resolvers for fields in an object
    // Any resolver here will take precedence over the field value that comes from the DB
    // GraphQL automatically passes some values to the resolver
    // One of the values is the object itself
    // Basically the resolver will be run for each job result that will be queried
    Job: {
        date: (job) => job.createdAt.slice(0, 'yyyy-mm-dd'.length)
    }
};