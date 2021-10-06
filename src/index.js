const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
require('dotenv').config();

const PORT = process.env.port || 3000;
const DB_HOST = process.env.DB_HOST;
const db = require('./db');
const models = require('./models/index');

const typeDefs = gql`
  type Query {
    hello: String
    notes: [Note!]!
    note(id: ID!): Note!
  }

  type Note {
    id: ID!
    content: String!
    author: String!
  }

  type Mutation {
    newNote(content: String!): Note!
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello world',
    notes: async () => await models.Note.find(),
    note: (parent, args) => {
      return models.Note.findById(args.id)
    }
  },
  Mutation: {
    newNote: async (parent, args) => {
      return await models.Note.create ({
        content: args.content,
        author: 'Me',
      })
    }
  }
};

const app = express();
db.connect(DB_HOST);

const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app, path: '/api' });

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT , () => {
  console.log(`GraphQL server: http://localhost:${PORT}${server.graphqlPath}`);
})
