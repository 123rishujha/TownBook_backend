const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    photo: { type: String },
    // role: { type: String, default: "user" },
    role: {
      type: String,
      enum: ["member", "librarian"],
      default: "member",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const UserModel = mongoose.model("user", userSchema);

module.exports = {
  UserModel,
};
