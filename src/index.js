const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const depthLimit = require('graphql-depth-limit');
const { createComplexityLimitRule } = require('graphql-validation-complexity');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const PORT = process.env.port || 3000;
const DB_HOST = process.env.DB_HOST;
const db = require('./db');
const typeDefs = require('./schema');
const resolvers = require('./resolvers/index');
const models = require('./models/index');

const app = express();
app.use(helmet());
app.use(cors());
db.connect(DB_HOST);

const verifyUser = (token) => {
  if (token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return 'Error';
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit[5], createComplexityLimitRule(1000)],
  context: ({ req }) => {
    const token = req.headers.authorization;
    const user = verifyUser(token);
 
    return { models, user };
  }
});
server.applyMiddleware({ app, path: '/api' });

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT, () => {
  console.log(`GraphQL server: http://localhost:${PORT}${server.graphqlPath}`);
});
