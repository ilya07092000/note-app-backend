const models = require('../models/index');
const jwt = require('jsonwebtoken');
const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');
const gravatar = require('../util/gravatar');
const crypto = require('crypto');
const mongoose = require('mongoose');

const Mutation = {
  newNote: async (parent, args, { models, user }) => {
    if (!user) {
      return new AuthenticationError('You must be logged in');
    }

    return await models.Note.create({
      content: args.content,
      author: mongoose.Types.ObjectId(user.id),
    });
  },
  deleteNote: async (parent, { id }, { models, user }) => {
    if (!user) {
      return new AuthenticationError('You must be logged in');
    }

    const note = await models.Note.findOne({ _id: id });

    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError('You do not have permission');
    }

    try {
      await note.remove();
      return true;
    } catch (err) {
      return false;
    }
  },
  updateNote: async (parent, { content, id }, { models, user }) => {
    if (!user) {
      return new AuthenticationError('You must be logged in');
    }

    const note = await models.Note.findOne({ _id: id });

    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError('You do not have permission');
    }

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
      throw new AuthenticationError('Invalid email or password')
    }

    const hmac = crypto.createHmac('sha512', '10');
    hmac.update(password);
    const hashedPass = hmac.digest('hex');
    
    if (hashedPass !== user.password) {
      throw new AuthenticationError('Error');
    };

    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  },
  toggleFavorite: async (parent, { id }, { models, user }) => {
    if (!user) {
      return new AuthenticationError('You must be logged in');
    }

    const note = await models.Note.findById(id);
    const noteHasCurrUser = note.favoritedBy.includes(user.id);
    console.log(note.id, id);
    
    if (noteHasCurrUser) {
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $pull: {
            favoritedBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: -1
          }
        },
        {
          new: true,
        }
      )
    } else {
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $push: {
            favoritedBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: 1
          }
        },
        {
          new: true,
        }
      )
    }
  },
};

module.exports = Mutation;
