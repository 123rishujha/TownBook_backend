const express = require("express");
const roomRouter = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  addRoom,
  getLibrarianRooms,
  updateRoom,
  deleteRoom,
  getAllRoom,
  getRoomById,
  updateRoomTimeSlots,
  getLibrarianRoomsById,
} = require("../controllers/roomCtrl");

// Authenticated User Routes
roomRouter.post("/add", authMiddleware, addRoom);
roomRouter.get("/", authMiddleware, getLibrarianRooms);
roomRouter.get("/librarian/:id", authMiddleware, getLibrarianRoomsById);

roomRouter.get("/:id", authMiddleware, getRoomById);
roomRouter.put("/update/:id", authMiddleware, updateRoom);
roomRouter.put("/update-temslote/:id", authMiddleware, updateRoomTimeSlots);
roomRouter.delete("/delete/:id", authMiddleware, deleteRoom);

// Public Route
roomRouter.get("/all-rooms", getAllRoom);

module.exports = {
  roomRouter,
};
