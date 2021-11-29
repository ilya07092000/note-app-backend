const { gql } = require("apollo-server-express");

const typeDefs = gql`
  scalar DateTime

  type UserAuth {
    user: User!
    token: String!
  }

  type Query {
    hello: String
    notes: [Note!]!
    note(id: ID!): Note!
    user(email: String!):
    User users: [User!]!
    me: User!
    noteFeed(cursor: String): NoteFeed
  }

  type Note {
    id: ID!
    content: String!
    author: User!
    createdAt: DateTime!
    updatedAt: DateTime!
    favoriteCount: Int!
    favoritedBy: [User!]
  }

  type User {
    id: ID!
    username: String!
    email: String!
    avatar: String!
    notes: [Note!]!
    favorites: [Note!]!
  }

  type Mutation {
    newNote(content: String!): Note!
    updateNote(id: ID!, content: String!): Note!
    deleteNote(id: ID!): Boolean!
    signup(username: String!, email: String!, password: String!): UserAuth!
    signin(email: String!, password: String!): UserAuth!
    toggleFavorite(id: ID!): Note!
  }

  type NoteFeed {
    notes: [Note]!
    cursor: String!
    hasNextPage: Boolean!
  }
`;

module.exports = typeDefs;