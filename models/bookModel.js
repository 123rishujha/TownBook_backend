const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    librarian: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },

    author: {
      type: String,
      required: true,
    },

    copies: {
      type: Number,
      required: true,
      min: 1,
    },
    reserved: {
      type: Number,
      required: true,
      default: 0,
    },
    coverImage: { type: String },
    description: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const BookModel = mongoose.model("book", bookSchema);

module.exports = {
  BookModel,
};
