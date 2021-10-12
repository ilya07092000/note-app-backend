const express = require('express');
const { ApolloServer } = require('apollo-server-express');
require('dotenv').config();

const PORT = process.env.port || 3000;
const DB_HOST = process.env.DB_HOST;
const db = require('./db');
const typeDefs = require('./schema');
const resolvers = require('./resolvers/index');
const models = require('./models/index');

const app = express();
db.connect(DB_HOST);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    return { models };
  }
});
server.applyMiddleware({ app, path: '/api' });

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT, () => {
  console.log(`GraphQL server: http://localhost:${PORT}${server.graphqlPath}`);
});
