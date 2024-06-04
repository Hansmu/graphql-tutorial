import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { getCompany, getCompanyByIdQuery } from '../graphql/queries';
import JobList from '../components/JobList';
import { useQuery } from '@apollo/client';

function CompanyPage() {
  const { companyId } = useParams();

  // Notice that you're building basically the same thing as with the original query, but now you have hooks integration
  const companyQuery = useQuery(getCompanyByIdQuery, {
    variables: {
      idVariableRightHereToUse: companyId
    }
  });

  const { data, loading, error } = companyQuery;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Data unavailable</div>
  }

 const { company } = data;

  return (
    <div>
      <h1 className="title">
        {company.name}
      </h1>
      <div className="box">
        {company.description}
      </div>

      <JobList jobs={company.jobs}/>
    </div>
  );
}

export default CompanyPage;
