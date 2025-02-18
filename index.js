const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { ApolloServerPluginLandingPageGraphQLPlayground } = require('@apollo/server-plugin-landing-page-graphql-playground');

const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });

const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const Database = require('./config/db');

const server = new ApolloServer({
	typeDefs,
	resolvers,
	plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
});

startStandaloneServer(server, {
	listen: { port: 4000 },
	context: async ({ req }) => {
		const token = req.headers['authorization'] || '';
		//si hay token
		if (token) {
			try {
				const alumno = jwt.verify(token.replace('Bearer ', ''), process.env.SECRET);
				return { alumno, token };
			} catch (error) {
				console.log("Error de token", error);
			}
		}
		return { alumno: null };
	}
}).then(({ url }) => {
	console.log(`Servidor listo en la URL ${url}`);
}).catch(err => {
	console.error('Error iniciando servidor:', err);
});
