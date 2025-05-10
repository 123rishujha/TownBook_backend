const { UserDocumentModel } = require("../models/userDocumentModel");

const addDocment = async (req, res) => {
  try {
    const { title, fileUrl, thumbnail, highlights } = req.body;

    const newDocument = new UserDocumentModel({
      user: req.user?._id,
      title,
      fileUrl,
      thumbnail,
      highlights,
    });

    await newDocument.save();
    res.status(201).json({
      success: true,
      msg: "Document added successfully",
      data: newDocument,
    });
  } catch (error) {
    let err = new Error("Failed to add Document");
    err.statusCode = 500;
    return next(err);
  }
};

const getUserDocs = async (req, res) => {
  try {
    const docs = await UserDocumentModel.find({ user: req.user?._id });
    res.status(200).json({ success: true, msg: "", data: docs });
  } catch (error) {
    let err = new Error("Failed to fetch docs");
    err.statusCode = 500;
    return next(err);
  }
};

const getUserDocSingle = async (req, res) => {
  const { id } = req.params;
  try {
    const document = await UserDocumentModel.findOne({
      _id: id,
      user: req.user?._id,
    });
    if (!document) {
      return res
        .status(404)
        .json({ success: false, msg: "Document not found" });
    }
    res.status(200).json({ success: true, msg: "", data: document });
  } catch (error) {
    let err = new Error("Failed to fetch docs");
    err.statusCode = 500;
    return next(err);
  }
};

const updateDoc = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const document = await UserDocumentModel.findOne({
      _id: id,
      user: req.user?._id,
    });
    if (!document) {
      return res
        .status(404)
        .json({ success: false, msg: "Document not found" });
    }

    Object.assign(document, updateData);
    await document.save();

    res.status(200).json({
      success: true,
      msg: "Document updated successfully",
      data: document,
    });
  } catch (error) {
    const err = new Error("Failed to update document");
    err.statusCode = 500;
    return next(err);
  }
};

const deleteDoc = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doc = await UserDocumentModel.findOneAndDelete({
      _id: id,
      user: req.user?._id,
    });
    if (!doc) {
      const err = new Error("Document not found or unauthorized");
      err.statusCode = 404;
      return next(err);
    }

    res
      .status(200)
      .json({ success: true, msg: "Document deleted successfully" });
  } catch (error) {
    err.statusCode = 500;
    return next(err);
  }
};

module.exports = {
  addDocment,
  getUserDocs,
  getUserDocSingle,
  updateDoc,
  deleteDoc,
};
