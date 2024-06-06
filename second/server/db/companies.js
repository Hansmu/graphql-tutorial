import DataLoader from 'dataloader';
import { connection } from './connection.js';

const getCompanyTable = () => connection.table('company');

export async function getCompany(id) {
  return await getCompanyTable().first().where({ id });
}

// With data loader, you need to return the results in the same order as the IDs were provided
// There's no smart matching
// Since the DB can return in any order, then it's worth doing a map here
export const companyLoader = new DataLoader(async (ids) => {
  console.log('[companyLoader] ids:', ids);
  const companies = await getCompanyTable().select().whereIn('id', ids);
  return ids.map((id) => companies.find((company) => company.id === id));
});
