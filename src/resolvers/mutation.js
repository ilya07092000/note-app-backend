const models = require('../models/index');

const Mutation = {
  newNote: async (parent, args, { models }) => {
    return await models.Note.create ({
      content: args.content,
      author: 'Me',
    })
  },
  deleteNote: async (parent, { id }, { models }) => {
    try {
      await models.Note.findOneAndRemove({ _id: id });
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  updateNote: async (parent, { content, id }, { models }) => {
   return await models.Note.findOneAndUpdate(
    {
      _id: id
    },
    {
      $set: {
        content
      }
    },
    {
      new: true
    }
   )
  }
};

module.exports = Mutation;