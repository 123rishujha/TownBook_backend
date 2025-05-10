const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    librarian: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    availableTimeSlots: [
      {
        date: String,
        slots: [
          {
            start: String,
            end: String,
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const RoomModel = mongoose.model("room", roomSchema);

module.exports = {
  RoomModel,
};
