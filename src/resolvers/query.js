const models = require('../models/index');

const Query = {
  hello: () => 'Hello world',
  notes: async (parent, args, { models }) => await models.Note.find(),
  note: (parent, args, { models }) => {
    return models.Note.findById(args.id)
  },
  user: async (parent, { email }, { models }) => {
    return await models.User.findOne({ email });
  },
  users: async (parent, args, { models }) => {
    return await models.User.find({});
  },
  me: async (parent, args, { model, user }) => {
    console.log(user);
    return await models.User.findById(user.id);
  }
};

module.exports = Query;