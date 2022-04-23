const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { Doctor } = require("../model/doctor");
const { User } = require("../model/user");

const { validateDoctorFields } = require("../helpers/fieldsValidator");
const getPaginatedData = require("../utils/getPaginatedData");

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
  } catch (err) {
    res.status(500).send({
      message: "Some error occurred while processing request!",
      error: err.message,
    });
  }
});

router.get("/get/all/by-query", async (req, res) => {
  const page = +req.query.page;
  const limit = +req.query.limit;

  let results = await getPaginatedData(Doctor, page, limit);

  if (!results) {
    return res.status(424).send({ message: "No doctors found!" });
  }

  if (results.hasOwnProperty("error")) {
    res.status(500).send(results);
  }

  try {
    const getPopulatedResult = async (data) => {
      let result = [];

      for (let i = 0; i < data.length; i++) {
        result[i] = await data[i].populate({
          path: "doctorAccount",
          select: "-_id",
          populate: { path: "role", select: "-_id" },
        });
      }

      return result;
    };

    results.result = await getPopulatedResult(results.result);
  } catch (error) {
    results = results;
  }

  res.status(200).send(results);
});

router.get("/get/one", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .send({ message: "'email' is required in body to search a doctor!" });
  }

  Doctor.findByEmail(email, function (err, doctor) {
    if (err) {
      return res.status(500).send({
        message: "Some error occurred while processing request!",
        error: err.message,
      });
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

  let newDoctor = new Doctor({
    doctorAccount: doctorId,
    ...body,
  });

  try {
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
    console.log(error);
    return res.status(500).send({
      message: "Some error occurred while processing request!",
      error: error.message,
    });
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
        return res.status(500).send({
          message: "Some error occurred while processing request!",
          error: error.message,
        });
      }
    } else {
      return res.status(400).send({
        message:
          "Request declined! Some or all properties in the 'body' are invalid or not supported!",
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: "Some error occurred while processing request!",
      error: error.message,
    });
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
      return res.status(500).send({
        message: "Some error occurred while processing request!",
        error: error.message,
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: "Some error occurred while processing request!",
      error: error.message,
    });
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
    return res.status(500).send({
      message: "Some error occurred while processing request!",
      error: error.message,
    });
  }
});

module.exports = router;
