const models = require('../models/index');

const Query = {
  hello: () => 'Hello world',
  notes: async (parent, args, { models }) => await models.Note.find(),
  note: (parent, args, { models }) => {
    return models.Note.findById(args.id)
  }
};

module.exports = Query;