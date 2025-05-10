const express = require("express");
const userLibraryRouter = express.Router();
const {
  addDocment,
  getUserDocs,
  updateDoc,
  deleteDoc,
  getUserDocSingle,
} = require("../controllers/userLibraryController");
const { authMiddleware } = require("../middlewares/authMiddleware");

// Authenticated User Routes
userLibraryRouter.post("/add", authMiddleware, addDocment);
userLibraryRouter.get("/", authMiddleware, getUserDocs);
userLibraryRouter.get("/:id", authMiddleware, getUserDocSingle);
userLibraryRouter.put("/update/:id", authMiddleware, updateDoc);
userLibraryRouter.delete("/delete/:id", authMiddleware, deleteDoc);

module.exports = {
  userLibraryRouter,
};
