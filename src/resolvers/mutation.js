const models = require('../models/index');
const jwt = require('jsonwebtoken');
const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');
const gravatar = require('../util/gravatar');
const crypto = require('crypto');

const Mutation = {
  newNote: async (parent, args, { models }) => {
    return await models.Note.create({
      content: args.content,
      author: 'Me'
    });
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
    );
  },
  signUp: async (parent, { username, email, password }, { models }) => {
    const hmac = crypto.createHmac('sha512', '10');
    hmac.update(password);
    const hashedPass = hmac.digest('hex');
    const avatar = gravatar(email);

    try {
      const user = await models.User.create({
        username,
        email,
        avatar,
        password: hashedPass
      });

      return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error('Error with account creating');
    }
  },
  signIn: async (parent, { username, email, password }, { models }) => {
    const user = await models.User.findOne({
      $or: [{email}, {username}]
    })

    if (!user) {
      throw new AuthenticationError('Error')
    }

    const hmac = crypto.createHmac('sha512', '10');
    hmac.update(password);
    const hashedPass = hmac.digest('hex');
    
    if (hashedPass !== user.password) {
      throw new AuthenticationError('Error');
    };

    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  }
};

module.exports = Mutation;
