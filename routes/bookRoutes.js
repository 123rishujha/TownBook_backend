const express = require("express");
const bookRouter = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  addBook,
  getLibrarianBooks,
  updateBook,
  deleteBook,
  getAllBooks,
  getBooksByLibrarian,
} = require("../controllers/bookCtrl");

// Authenticated User Routes
bookRouter.post("/add", authMiddleware, addBook);
bookRouter.get("/", authMiddleware, getLibrarianBooks);
bookRouter.get("/librarian/:librarianId", authMiddleware, getBooksByLibrarian);
bookRouter.put("/update/:id", authMiddleware, updateBook);
bookRouter.delete("/delete/:id", authMiddleware, deleteBook);

// Public Route
bookRouter.get("/all-books", getAllBooks);

module.exports = {
  bookRouter,
};
