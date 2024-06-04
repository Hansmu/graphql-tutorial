import { useMutation } from "@apollo/client";
import { createJobMutation, jobByIdQuery } from "./queries";

export function useCreateJob() {
    const [ mutate, result ] = useMutation(createJobMutation);

    const createJob = async ({ title, description }) => {
        const { data: { job } } = await mutate({
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
        });

        return job;
    }

    // Need to use the mutate function to actually send a mutation request
    return {
        createJob,
        result
    };
}