import { createJob, deleteJob, getJob, getJobs, getJobsByCompany, updateJob } from './db/jobs.js';
import { companyLoader, getCompany } from './db/companies.js';
import { GraphQLError } from 'graphql';

const notFoundError = (message) => {
    return new GraphQLError(message, {
        extensions: {
            code: 'NOT_FOUND'
        }
    });
};

const unauthenticatedError = () => {
    return new GraphQLError('Unauthenticated request', {
        extensions: {
            code: 'UNAUTHENTICATED'
        }
    });
};

export const resolvers = {
    Mutation: {
        // The third parameter is the context variable that's filled in server.js
        createJob: (_root, { input: { title, description } }, { user }) => {
            if (!user) {
                throw unauthenticatedError();
            }

            const companyId = user.companyId;
            return createJob({ companyId, title, description });
        },
        updateJob: (_root, { input: { id, title, description } }) => updateJob({ id, title, description }),
        deleteJob: async (_root, { id }, { user }) => {
            if (!user) {
                throw unauthenticatedError();
            }

            const companyId = user.companyId;
            
            const job = await deleteJob(id, companyId);

            if (!job) {
                throw notFoundError(`No job found with id ${id}`);
            }

            return job;
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

    // And the above produces an issue - for each job, you're doing an additional DB call.
    // You'd probably want to batch those to waste less resources.
    // There are some packages for this - one being Dataloader.
    Job: {
        company: (job) => companyLoader.load(job.companyId),
        date: (job) => job.createdAt.slice(0, 'yyyy-mm-dd'.length)
    }
};