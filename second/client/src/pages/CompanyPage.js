import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { getCompany } from '../graphql/queries';
import JobList from '../components/JobList';

function CompanyPage() {
  const { companyId } = useParams();
  const [ state, setState ] = useState({
    company: null,
    loading: true,
    error: false
  });

  const { company, loading, error } = state;

  useEffect(() => {
    getCompany(companyId)
      .then(company => setState({
        company,
        loading: false,
        error: false,
      }))
      .catch(() => setState({
        company: null,
        loading: false,
        error: true
      }));
  }, [companyId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Data unavailable</div>
  }

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
