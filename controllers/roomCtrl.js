const { RoomModel } = require("../models/roomModel");

// Add Book
const addRoom = async (req, res, next) => {
  try {
    const { name, capacity, availableTimeSlots } = req.body;
    const newRoom = await RoomModel.create({
      name,
      capacity,
      availableTimeSlots,
      librarian: req.user?._id,
    });
    res
      .status(201)
      .json({ success: true, msg: "Room added successfully", data: newRoom });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Room creation failed", error: err.message });
  }
};

// Add or Update availableTimeSlots in a Room
const updateRoomTimeSlots = async (req, res, next) => {
  try {
    const { id } = req.params; // room ID
    const { date, slots } = req.body; // new or updated slot data
    const userId = req.user?._id;

    if (!date || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Date and slots are required and must be valid.",
      });
    }

    const room = await RoomModel.findOne({ _id: id, librarian: userId });

    if (!room) {
      return res
        .status(404)
        .json({ success: false, msg: "Room not found or unauthorized" });
    }

    // Find index of existing date
    const dateIndex = room.availableTimeSlots.findIndex(
      (item) => item.date === date
    );

    if (dateIndex > -1) {
      // If date exists, update its slots
      room.availableTimeSlots[dateIndex].slots = slots;
    } else {
      // If not, push new date and slots
      room.availableTimeSlots.push({ date, slots });
    }

    await room.save();

    res.status(200).json({
      success: true,
      msg: "Time slots updated successfully",
      data: room.availableTimeSlots,
    });
  } catch (error) {
    next(error);
  }
};

// Get Books added by Logged-in Librarian
const getLibrarianRooms = async (req, res, next) => {
  try {
    const rooms = await RoomModel.find({ librarian: req.user?._id });
    res.status(200).json({ success: true, msg: "", data: rooms });
  } catch (error) {
    const err = new Error("Failed to fetch books");
    err.statusCode = 500;
    return next(err);
  }
};

// Get libariran rooms by librarianId
const getLibrarianRoomsById = async (req, res, next) => {
  try {
    const rooms = await RoomModel.find({ librarian: req.params.id });
    res.status(200).json({ success: true, msg: "", data: rooms });
  } catch (error) {
    const err = new Error("Failed to fetch books");
    err.statusCode = 500;
    return next(err);
  }
};

// GET a single room by ID
const getRoomById = async (req, res) => {
  try {
    const room = await RoomModel.findById(req.params.id);
    if (!room)
      return res
        .status(404)
        .json({ message: "Room not found", success: false });
    // res.status(200).json(room);
    res.status(200).json({ success: true, msg: "", data: room });
  } catch (err) {
    res.status(500).json({ message: "Error fetching room" });
  }
};

// Update Book
const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const room = await RoomModel.findOne({
      _id: id,
      librarian: req.user?._id,
    });

    if (!room) {
      return res.status(404).json({ success: false, msg: "Boom not found" });
    }

    Object.assign(room, updateData);
    await room.save();

    res
      .status(200)
      .json({ success: true, msg: "Room updated successfully", data: room });
  } catch (error) {
    // const err = new Error("Failed to update Room");
    // err.statusCode = 500;
    return next(error);
  }
};

// Delete Book
const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    const room = await RoomModel.findOneAndDelete({
      _id: id,
      librarians: req.user?._id,
    });

    if (!room) {
      const err = new Error("Room not found or unauthorized");
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({ success: true, msg: "Room deleted successfully" });
  } catch (error) {
    const err = new Error("Failed to delete Room");
    err.statusCode = 500;
    return next(err);
  }
};

// Get All Books (Optional: For general users/explore page)
const getAllRoom = async (req, res, next) => {
  try {
    const books = await RoomModel.find().populate("librarians", "name");
    res.status(200).json({ success: true, msg: "Rooms fetched", data: books });
  } catch (error) {
    const err = new Error("Failed to fetch rooms");
    err.statusCode = 500;
    return next(err);
  }
};

module.exports = {
  addRoom,
  updateRoomTimeSlots,
  getLibrarianRooms,
  getLibrarianRoomsById,
  getRoomById,
  updateRoom,
  deleteRoom,
  getAllRoom,
};
