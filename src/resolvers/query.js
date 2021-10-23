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
    return await models.User.find({}).limit(100);
  },
  me: async (parent, args, { models, user }) => {
    console.log(user);
    return await models.User.findById(user.id);
  },
  noteFeed: async (parent, { cursor }, { models }) => {
    const LIMIT = 10;
    let hasNextPage = false;
    let cursorQuery = {};

    if (cursor) {
      cursorQuery = { _id: { $lt: cursor } }
    }
 
    let notes = await models.Note.find(cursorQuery)
      .sort({ _id: -1 })
      .limit(LIMIT + 1);

    if (notes.length > LIMIT) {
      hasNextPage = true;
      notes = notes.slice(0, -1);
    }

    const newCursor = notes[notes.length - 1]._id;

    return {
      notes,
      cursor: newCursor,
      hasNextPage
    }
  },
};

module.exports = Query;