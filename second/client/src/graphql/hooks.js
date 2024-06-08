import { useQuery } from "@apollo/client";
import { getCompanyByIdQuery, getJobsQuery, jobByIdQuery } from "./queries";

export function useCompany(companyId) {
    // Notice that you're building basically the same thing as with the original query, but now you have hooks integration
    const companyQuery = useQuery(getCompanyByIdQuery, {
        variables: {
            idVariableRightHereToUse: companyId
        }
    });

    return {
        company: companyQuery.data?.company,
        loading: companyQuery.loading,
        error: Boolean(companyQuery.error)
    };
}

export function useJobs(limit, offset) {
    const jobsQuery = useQuery(getJobsQuery, {
        variables: { limit, offset }
    });

    return {
        jobs: jobsQuery.data?.jobs,
        loading: jobsQuery.loading,
        error: Boolean(jobsQuery.error)
    };
}

export function useJob(jobId) {
    const jobQuery = useQuery(jobByIdQuery, {
        variables: {
            idVariableRightHereToUse: jobId
        }
    });

    return {
        job: jobQuery.data?.job,
        loading: jobQuery.loading,
        error: Boolean(jobQuery.error)
    };
}