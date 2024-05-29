import { createJob, getJob, getJobs, getJobsByCompany } from './db/jobs.js';
import { getCompany } from './db/companies.js';
import { GraphQLError } from 'graphql';

const notFoundError = (message) => {
    return new GraphQLError(message, {
        extensions: {
            code: 'NOT_FOUND'
        }
    });
};

export const resolvers = {
    Mutation: {
        createJob: (_root, { input: { title, description } }) => {
            const companyId = 'FjcJCHJALA4i'; // TODO Fix once company based sessions exist
            return createJob({ companyId, title, description });
        }
    },
    Query: {
        // The first parameter is the root object, which in this case will be undefined
        // The second parameter will contain all the parameters that were passed in
        
        job: async (_root, args) => {
            const job = await getJob(args.id);

            if (!job) {
                throw notFoundError(`No job found with ID ${args.id}`);
            }

            return job;
        },
        jobs: getJobs,
        // When an invalid ID is provided, then this returns null. We probably don't want that
        // There are two ways to go about this.
        // 1. Declare that this cannot return null. 
        //      This, however, makes the server throw an INTERNAL_SERVER_ERROR, so it's not optimal, because the real issue was an invalid ID.
        // 2. Create a custom error
        //      This'd provide proper info on what was actually wrong.
        //      To do this, you can throw a GraphQLError, which can be imported from the `graphql` package.
        company: async (_root, args) => {
            const company = await getCompany(args.id);
        
            if (!company) {
                throw notFoundError(`No company found with ID ${args.id}`);
            }

            return company;
        },
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