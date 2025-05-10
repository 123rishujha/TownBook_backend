const { BookModel } = require("../models/bookModel");
const { UserModel } = require("../models/userModel");

// Add Book
const addBook = async (req, res, next) => {
  try {
    const { title, author, copies, coverImage, description } = req.body;

    const newBook = new BookModel({
      librarian: req.user?._id,
      title,
      author,
      copies,
      coverImage,
      description,
    });

    await newBook.save();
    res
      .status(201)
      .json({ success: true, msg: "Book added successfully", data: newBook });
  } catch (error) {
    const err = new Error("Failed to add book");
    err.statusCode = 500;
    return next(err);
  }
};

// Get Books added by Logged-in Librarian
const getLibrarianBooks = async (req, res, next) => {
  try {
    const books = await BookModel.find({ librarian: req.user?._id });
    res.status(200).json({ success: true, msg: "", data: books });
  } catch (error) {
    const err = new Error("Failed to fetch books");
    err.statusCode = 500;
    return next(err);
  }
};

// Update Book
const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const book = await BookModel.findOne({
      _id: id,
      librarian: req.user?._id,
    });

    if (!book) {
      return res.status(404).json({ success: false, msg: "Book not found" });
    }

    Object.assign(book, updateData);
    await book.save();

    res
      .status(200)
      .json({ success: true, msg: "Book updated successfully", data: book });
  } catch (error) {
    const err = new Error("Failed to update book");
    err.statusCode = 500;
    return next(err);
  }
};

// Delete Book
const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    const book = await BookModel.findOneAndDelete({
      _id: id,
      librarians: req.user?._id,
    });

    if (!book) {
      const err = new Error("Book not found or unauthorized");
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({ success: true, msg: "Book deleted successfully" });
  } catch (error) {
    const err = new Error("Failed to delete book");
    err.statusCode = 500;
    return next(err);
  }
};

// Get All Books (Optional: For general users/explore page)
const getAllBooks = async (req, res, next) => {
  try {
    const books = await BookModel.find().populate("librarians", "name");
    res.status(200).json({ success: true, msg: "Books fetched", data: books });
  } catch (error) {
    const err = new Error("Failed to fetch books");
    err.statusCode = 500;
    return next(err);
  }
};


const getBooksByLibrarian = async (req, res, next) => {
  const { librarianId } = req.params;

  if (!librarianId) {
    const error = new Error("Librarian ID is required");
    error.statusCode = 400;
    return next(error);
  }

  try {
    // Optional: check if librarian exists
    const librarian = await UserModel.findById(librarianId);
    if (!librarian || librarian.role !== "librarian") {
      const error = new Error("Librarian not found or invalid");
      error.statusCode = 404;
      return next(error);
    }
    
    console.log("aljkdf j librarian",librarian)

    const books = await BookModel.find({ librarian: librarianId });



    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (err) {
    console.error("Error in getBooksByLibrarian:", err);
    return next(err);
  }
};

module.exports = {
  addBook,
  getLibrarianBooks,
  updateBook,
  deleteBook,
  getAllBooks,
  getBooksByLibrarian,
};
