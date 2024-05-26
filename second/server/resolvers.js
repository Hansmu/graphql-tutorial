import { getJob, getJobs, getJobsByCompany } from './db/jobs.js';
import { getCompany } from './db/companies.js';

export const resolvers = {
    Query: {
        // The first parameter is the root object, which in this case will be undefined
        // The second parameter will contain all the parameters that were passed in
        
        job: (_root, args) => getJob(args.id),
        jobs: getJobs,
        company: (_root, args) => getCompany(args.id),
    },
    Company: {
        jobs: (company) => getJobsByCompany(company.id)
    },
    // We can define custom resolvers for fields in an object
    // Any resolver here will take precedence over the field value that comes from the DB
    // GraphQL automatically passes some values to the resolver
    // One of the values is the object itself
    // Basically the resolver will be run for each job result that will be queried
    Job: {
        company: (job) => getCompany(job.companyId),
        date: (job) => job.createdAt.slice(0, 'yyyy-mm-dd'.length)
    }
};