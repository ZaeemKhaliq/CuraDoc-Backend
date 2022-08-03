const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const ErrorHandler = require("../classes/ErrorHandler");

const { Doctor } = require("../model/doctor");
const { User } = require("../model/user");

const { validateDoctorFields } = require("../helpers/fieldsValidator");
const getPaginatedData = require("../utils/getPaginatedData");
const getStructuredFilters = require("../utils/getStructuredFilters.js");

router.get("/get/all", async (req, res) => {
  try {
    const doctors = await Doctor.find().populate({
      path: "doctorAccount",
      select: "-_id",
      populate: { path: "role", select: "-_id" },
    });

    if (!doctors) {
      return res.status(424).send({ message: "No doctors found!" });
    }

    res.status(200).send(doctors);
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

router.post("/get/all/count", async (req, res) => {
  const filters = req.body;

  const structuredFilters = getStructuredFilters(filters);

  try {
    const count = await Doctor.countDocuments(structuredFilters);

    return res.status(200).send({ doctorsCount: count });
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

router.post("/get/all/by-query", async (req, res) => {
  const page = +req.query.page;
  const limit = +req.query.limit;
  const filters = req.body;

  const structuredFilters = getStructuredFilters(filters);

  let results = await getPaginatedData(Doctor, page, limit, structuredFilters);

  if (!results) {
    return res.status(424).send({ message: "No doctors found!" });
  }

  if (results.hasOwnProperty("error")) {
    res.status(500).send(results);
  }

  try {
    const getPopulatedResult = async (data) => {
      let result = [];

      // for (let i = 0; i < data.length; i++) {
      //   result[i] = await data[i].populate({
      //     path: "doctorAccount",
      //     select: "-_id",
      //     populate: { path: "role", select: "-_id" },
      //   });
      // }

      result = await Doctor.populate(data, {
        path: "doctorAccount",
        select: "-_id",
        populate: { path: "role", select: "-_id" },
      });

      return result;
    };

    results.totalCount = results?.result[0]?.count[0]?.count || 0;
    results.result = await getPopulatedResult(results.result[0].doctors);
  } catch (error) {
    results = results;
  }

  res.status(200).send(results);
});

router.get("/get/one-by-email", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .send({ message: "'email' is required in body to search a doctor!" });
  }

  Doctor.findByEmail(email, function (err, doctor) {
    if (err) {
      return ErrorHandler.onCatchResponse({ res, error: err });
    }

    if (!doctor) {
      return res.status(204).send({
        message: "No such doctor with this email was found in our records!",
      });
    }

    return res.status(200).send(doctor);
  });
});

router.post("/add-doctor", async (req, res) => {
  const { doctorAccount, ...body } = req.body;

  const userExists = await User.findOne({ email: doctorAccount });

  if (!userExists) {
    return res.status(404).send({
      message:
        "Can't add as a doctor! No user account with this email was found in our records! ",
    });
  }

  const doctorExists = await Doctor.findOne({ doctorAccount: userExists.id });

  if (doctorExists) {
    return res
      .status(403)
      .send({ message: "A doctor is already registered with this email!" });
  }

  let doctorId = userExists.id;

  const isValid = validateDoctorFields(req.body, "add");
  if (!isValid) {
    return res.status(400).send({
      message:
        "Request declined! Some or all properties in the 'body' are invalid or not supported!",
    });
  }

  try {
    let newDoctor = new Doctor({
      doctorAccount: doctorId,
      ...body,
    });
    await newDoctor.save();

    let resp;

    try {
      resp = await newDoctor.populate({
        path: "doctorAccount",
        select: "-password -_id",
        populate: { path: "role", select: "-_id" },
      });
    } catch (error) {
      resp = newDoctor;
    }

    return res.status(201).send({
      message: "Doctor added successfully!",
      addedDoctor: resp,
    });
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

router.put("/update-doctor/:id", async (req, res) => {
  const { id: docId } = req.params;

  if (!mongoose.isValidObjectId(docId)) {
    return res.status(400).send({ message: "Invalid Doctor ID!" });
  }

  try {
    const doctorExists = await Doctor.findById(docId);

    if (!doctorExists) {
      return res
        .status(404)
        .send({ message: "Doctor with this ID not found!" });
    }

    const isValid = validateDoctorFields(req.body, "update");

    if (isValid) {
      let { body } = req;

      const updateObject = {
        ...body,
      };

      try {
        const result = await Doctor.findByIdAndUpdate(docId, updateObject, {
          new: true,
        }).select("-doctorAccount");

        return res.status(201).send({
          message: "Doctor updated successfully!",
          updatedDoctor: result,
        });
      } catch (error) {
        return ErrorHandler.onCatchResponse({ res, error });
      }
    } else {
      return res.status(400).send({
        message:
          "Request declined! Some or all properties in the 'body' are invalid or not supported!",
      });
    }
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

router.put("/update-sendbird-details/:id", async (req, res) => {
  const { id: docId } = req.params;

  if (!mongoose.isValidObjectId(docId)) {
    return res.status(400).send({ message: "Invalid Doctor ID!" });
  }

  try {
    const doctorExists = await Doctor.findById(docId);

    if (!doctorExists) {
      return res
        .status(404)
        .send({ message: "Doctor with this ID not found!" });
    }

    const isValid = validateDoctorFields(req.body, "sendbird-update");

    if (!isValid) {
      return res.status(400).send({
        message:
          "Request declined! Some or all properties in the 'body' are invalid or not supported!",
      });
    }

    let { body } = req;

    const updateObject = {
      ...body,
    };

    try {
      const result = await Doctor.findByIdAndUpdate(docId, updateObject, {
        new: true,
      }).select("-doctorAccount");

      return res.status(201).send({
        message: "Doctor updated successfully!",
        updatedDoctor: result,
      });
    } catch (error) {
      return ErrorHandler.onCatchResponse({ res, error });
    }
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

router.put("/verify-doctor/:id", async (req, res) => {
  const { id: doctorId } = req.params;

  if (!mongoose.isValidObjectId(doctorId)) {
    return res.status(400).send({ message: "Invalid Doctor ID!" });
  }

  try {
    const doctorExists = await Doctor.findById(doctorId);

    if (!doctorExists) {
      return res
        .status(404)
        .send({ message: "Doctor with this ID not found!" });
    }

    const isValid = validateDoctorFields(req.body, "verify");

    if (!isValid) {
      return res.status(400).send({
        message:
          "Request declined! Some or all properties in the 'body' are invalid or not supported!",
      });
    }

    const updateObject = {
      ...req.body,
    };

    try {
      const result = await Doctor.findByIdAndUpdate(doctorId, updateObject, {
        new: true,
      });

      return res
        .status(201)
        .send({ message: "Doctor verified successfully!", doctor: result });
    } catch (error) {
      return ErrorHandler.onCatchResponse({ res, error });
    }
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

router.delete("/remove-doctor/:id", async (req, res) => {
  const docId = req.params.id;

  if (!mongoose.isValidObjectId(docId)) {
    return res.status(400).send({ message: "Invalid object ID!" });
  }

  try {
    let result = await Doctor.findByIdAndRemove(docId);

    if (!result) {
      return res
        .status(404)
        .send({ message: "No doctor found with provided ID!" });
    }

    let resp;

    try {
      resp = await result.populate({
        path: "doctorAccount",
        populate: { path: "role" },
      });
    } catch (error) {
      resp = result;
    }

    return res
      .status(200)
      .send({ message: "Doctor removed successfully!", removedDoctor: resp });
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

module.exports = router;
