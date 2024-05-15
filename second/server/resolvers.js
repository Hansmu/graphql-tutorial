import { getJobs } from './db/jobs.js';

export const resolvers = {
    Query: {
        jobs: async () => {
           return await getJobs();
        }
    }
};