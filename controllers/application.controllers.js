const { ApplicationModel } = require("../models/application.model");
const { JobPostModel } = require("../models/jobpost.model");
const { getFitScore } = require("../utils/getFitScore");
const mongoose = require("mongoose");

// CREATE
const createApplication = async (req, res, next) => {
  try {
    // Only jobseekers can apply
    if (req.user.role !== "jobseeker") {
      return res
        .status(403)
        .json({ success: false, msg: "Only jobseekers can apply for jobs." });
    }
    const { jobId } = req.body;
    // Prevent duplicate applications
    const exists = await ApplicationModel.findOne({
      jobId,
      candidateId: req.user._id,
    });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, msg: "You have already applied to this job." });
    }
    // Check if job exists
    const job = await JobPostModel.findById(jobId);
    if (!job) {
      return res
        .status(404)
        .json({ success: false, msg: "Job post not found." });
    }
    const application = new ApplicationModel({
      ...req.body,
      candidateId: req.user._id,
    });
    await application.save();
    // Increment applicantsCount for the job post
    await JobPostModel.findByIdAndUpdate(jobId, {
      $inc: { applicantsCount: 1 },
    });
    res.status(201).json({
      success: true,
      data: application,
      msg: "Application Sent Successfully!",
    });
  } catch (err) {
    next(err);
  }
};

// GET ALL (admin/recruiter sees all, jobseeker sees own)
const getAllApplications = async (req, res, next) => {
  try {
    let matchStage = {};
    if (req.user.role === "jobseeker") {
      matchStage.candidateId = req.user._id;
    } else if (req.user.role === "recruiter") {
      // Recruiter sees applications for their jobs
      const jobs = await JobPostModel.find(
        { recruiterId: req.user._id },
        "_id"
      );
      matchStage.jobId = { $in: jobs.map((j) => j._id) };
    }

    const applications = await ApplicationModel.aggregate([
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: "jobposts",
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      {
        $unwind: "$job",
      },
      {
        $lookup: {
          from: "users",
          localField: "job.recruiterId",
          foreignField: "_id",
          as: "company",
        },
      },
      {
        $unwind: "$company",
      },
      {
        $lookup: {
          from: "users",
          localField: "candidateId",
          foreignField: "_id",
          as: "candidate",
        },
      },
      {
        $unwind: "$candidate",
      },
      {
        $lookup: {
          from: "users",
          localField: "interview.interviewerId",
          foreignField: "_id",
          as: "interviewer",
        },
      },
      {
        $unwind: {
          path: "$interviewer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          aiFitScore: 1,
          createdAt: 1,
          updatedAt: 1,
          "job._id": 1,
          "job.title": 1,
          "job.company": 1,
          "job.location": 1,
          "job.jobType": 1,
          "job.salaryRange": 1,
          "job.description": 1,
          "job.requiredSkills": 1,
          "job.experienceRequired": 1,
          "company._id": 1,
          "company.name": 1,
          "company.email": 1,
          "company.companyName": 1,
          "company.companyLogo": 1,
          "company.companyWebsite": 1,
          "company.companyDescription": 1,
          "company.companyLocation": 1,
          "candidate._id": 1,
          "candidate.name": 1,
          "candidate.email": 1,
          "candidate.resume": 1,
          "interview.scheduledAt": 1,
          "interview.zoomLink": 1,
          "interview.feedback": 1,
          "interview.feedbackSummary": 1,
          "interviewer._id": 1,
          "interviewer.name": 1,
          "interviewer.email": 1,
          "offerLetter.url": 1,
          "offerLetter.accepted": 1,
          "offerLetter.respondedAt": 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    res.json({
      success: true,
      data: applications,
      msg: "Applications Fetched Successfully!",
    });
  } catch (err) {
    next(err);
  }
};

// GET ONE (candidate or recruiter of job)
const getApplicationById = async (req, res, next) => {
  try {
    const application = await ApplicationModel.findById(req.params.id).populate(
      {
        path: "jobId",
        select:
          "title company location jobType salaryRange experienceRequired description requirements recruiterId",
        populate: {
          path: "recruiterId",
          select: "name email company",
        },
      }
    );

    if (!application)
      return res
        .status(404)
        .json({ success: false, msg: "Application not found." });
    if (
      (req.user.role === "jobseeker" &&
        String(application.candidateId) !== String(req.user._id)) ||
      req.user.role === "recruiter"
    ) {
      // For recruiter, check if owns the job
      const job = await JobPostModel.findById(application.jobId);
      if (!job || String(job.recruiterId) !== String(req.user._id)) {
        return res.status(403).json({ success: false, msg: "Unauthorized." });
      }
    } else if (req.user.role !== "jobseeker" && req.user.role !== "recruiter") {
      return res.status(403).json({ success: false, msg: "Unauthorized." });
    }
    res.json({
      success: true,
      data: application,
      msg: "Application Fetched Successfully!",
    });
  } catch (err) {
    next(err);
  }
};

// UPDATE (candidate can withdraw, recruiter can update status/feedback/offer)
const updateApplication = async (req, res, next) => {
  try {
    const application = await ApplicationModel.findById(req.params.id);
    if (!application)
      return res
        .status(404)
        .json({ success: false, msg: "Application not found." });
    const job = await JobPostModel.findById(application.jobId);
    if (req.user.role === "jobseeker") {
      return res.status(403).json({ success: false, msg: "Unauthorized." });
    } else if (req.user.role === "recruiter") {
      if (!job || String(job.recruiterId) !== String(req.user._id)) {
        return res.status(403).json({ success: false, msg: "Unauthorized." });
      }
      // Recruiter can update status, interview, offerLetter, aiFitScore
      if (req.body.status) application.status = req.body.status;
      if (req.body.aiFitScore) application.aiFitScore = req.body.aiFitScore;
      if (req.body.interview)
        application.interview = {
          ...application.interview,
          ...req.body.interview,
        };
      if (req.body.offerLetter)
        application.offerLetter = {
          ...application.offerLetter,
          ...req.body.offerLetter,
        };
    } else {
      return res.status(403).json({ success: false, msg: "Unauthorized." });
    }
    await application.save();
    res.json({ success: true, data: application, msg: "Updated Successfully" });
  } catch (err) {
    next(err);
  }
};

const jobseekerAccpet_rejectApplication = async (req, res, next) => {
  const { accepted } = req.body;
  try {
    const application = await ApplicationModel.findById(req.params.id);
    if (!application)
      return res
        .status(404)
        .json({ success: false, msg: "Application not found." });

    application.offerLetter["accepted"] = accepted ? true : false;
    application["status"] = accepted ? "accepted" : "rejected";

    await application.save();
    res.json({
      success: true,
      data: application,
      msg: `${accepted ? "Accepted" : "Rejected"} Successfully`,
    });
  } catch (err) {
    next(err);
  }
};

const getApplicationMatchScore = async (req, res, next) => {
  const { resumeUrl, jobDescription } = req.body;

  try {
    const getScore = await getFitScore(resumeUrl, jobDescription);
    console.log("getScore", getScore);
    res.json({ success: true, data: getScore });
  } catch (err) {
    next(err);
  }
};

const getApplicationsByJobId = async (req, res, next) => {
  try {
    const { jobId, status, startDate, endDate } = req.body;
    const recruiterId = req.user._id;

    const matchStage = {
      jobId: new mongoose.Types.ObjectId(jobId),
      "job.recruiterId": new mongoose.Types.ObjectId(recruiterId),
    };

    // Add optional filters
    if (status && status !== "") {
      matchStage.status = status;
    }

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) {
        matchStage.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchStage.createdAt.$lte = new Date(endDate);
      }
    }

    const applications = await ApplicationModel.aggregate([
      {
        $lookup: {
          from: "jobposts",
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      {
        $unwind: "$job",
      },
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: "users",
          localField: "candidateId",
          foreignField: "_id",
          as: "candidate",
        },
      },
      {
        $unwind: "$candidate",
      },
      {
        $lookup: {
          from: "users",
          localField: "interview.interviewerId",
          foreignField: "_id",
          as: "interviewer",
        },
      },
      {
        $unwind: {
          path: "$interviewer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          aiFitScore: 1,
          createdAt: 1,
          updatedAt: 1,
          "job._id": 1,
          "job.title": 1,
          "job.company": 1,
          "job.location": 1,
          "job.jobType": 1,
          "job.salaryRange": 1,
          "job.description": 1,
          "job.requiredSkills": 1,
          "job.experienceRequired": 1,
          "candidate._id": 1,
          "candidate.name": 1,
          "candidate.email": 1,
          "candidate.resume": 1,
          "interview.scheduledAt": 1,
          "interview.zoomLink": 1,
          "interview.feedback": 1,
          "interview.feedbackSummary": 1,
          "interviewer._id": 1,
          "interviewer.name": 1,
          "interviewer.email": 1,
          "offerLetter.url": 1,
          "offerLetter.accepted": 1,
          "offerLetter.respondedAt": 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    res.json({
      success: true,
      data: applications,
      msg: "Applications Fetched Successfully!",
    });
  } catch (err) {
    next(err);
  }
};

// GET SINGLE application by jobId and candidateId (recruiter/jobseeker of job/application)
const getApplicationByJobAndCandidateId = async (req, res, next) => {
  try {
    const { jobId, candidateId } = req.params;

    // Use aggregation to get the same structure as getAllApplications
    const applications = await ApplicationModel.aggregate([
      {
        $match: {
          jobId: new mongoose.Types.ObjectId(jobId),
          candidateId: new mongoose.Types.ObjectId(candidateId),
        },
      },
      {
        $lookup: {
          from: "jobposts",
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      {
        $unwind: "$job",
      },
      {
        $lookup: {
          from: "users",
          localField: "candidateId",
          foreignField: "_id",
          as: "candidate",
        },
      },
      {
        $unwind: "$candidate",
      },
      {
        $lookup: {
          from: "users",
          localField: "job.recruiterId",
          foreignField: "_id",
          as: "company",
        },
      },
      {
        $unwind: "$company",
      },
      {
        $lookup: {
          from: "users",
          localField: "interview.interviewerId",
          foreignField: "_id",
          as: "interviewer",
        },
      },
      {
        $unwind: {
          path: "$interviewer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          aiFitScore: 1,
          createdAt: 1,
          updatedAt: 1,
          "job._id": 1,
          "job.title": 1,
          "job.company": 1,
          "job.location": 1,
          "job.jobType": 1,
          "job.salaryRange": 1,
          "job.description": 1,
          "job.requiredSkills": 1,
          "job.experienceRequired": 1,
          "company._id": 1,
          "company.name": 1,
          "company.email": 1,
          "company.companyName": 1,
          "company.companyLogo": 1,
          "company.companyWebsite": 1,
          "company.companyDescription": 1,
          "company.companyLocation": 1,
          "candidate._id": 1,
          "candidate.name": 1,
          "candidate.email": 1,
          "candidate.resume": 1,
          "interview.scheduledAt": 1,
          "interview.zoomLink": 1,
          "interview.feedback": 1,
          "interview.feedbackSummary": 1,
          "interviewer._id": 1,
          "interviewer.name": 1,
          "interviewer.email": 1,
          "offerLetter.url": 1,
          "offerLetter.accepted": 1,
          "offerLetter.respondedAt": 1,
        },
      },
      {
        $limit: 1, // Limit to one result as we expect a single application
      },
    ]);

    const application = applications.length > 0 ? applications[0] : null;

    if (!application) {
      return res
        .status(404)
        .json({ success: false, msg: "Application not found." });
    }

    res.json({
      success: true,
      data: application,
      msg: "Application Fetched Successfully!",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  getApplicationMatchScore,
  getApplicationsByJobId,
  getApplicationByJobAndCandidateId,
  jobseekerAccpet_rejectApplication,
};
