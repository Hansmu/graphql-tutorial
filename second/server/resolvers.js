export const resolvers = {
    Query: {
        job: () => {
            return {
                id: 'test-id',
                title: 'The title',
                description: 'The description'
            }
        }
    }
};