import JobList from '../components/JobList';
import { useJobs } from '../graphql/hooks';

const jobsDefault = [];

function HomePage() {
  const { jobs } = useJobs();

  return (
    <div>
      <h1 className="title">
        Job Board
      </h1>
      <JobList jobs={jobs || jobsDefault} />
    </div>
  );
}

export default HomePage;
