const mongoose = require("mongoose");

const userDocumentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    thumbnail: { type: String },
    highlights: [],
  },
  { timestamps: true }
);

const UserDocumentModel = mongoose.model("userDocument", userDocumentSchema);

module.exports = { UserDocumentModel };
