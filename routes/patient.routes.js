const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { Patient } = require("../model/patient");

const { validatePatientFields } = require("../helpers/fieldsValidator");

router.get("/get/all", async (req, res) => {
  try {
    const patients = await Patient.find();

    if (!patients) {
      return res.status(404).send({ message: "No patients found!" });
    }

    return res.status(200).send(patients);
  } catch (err) {
    return res.status(500).send({
      message: "Some error occurred while processing request.",
      error: err.message,
    });
  }
});

router.get("/get/one/:id", async (req, res) => {
  const patientId = req.params.id;

  try {
    const patient = Patient.findById(patientId);

    if (!patient) {
      return res.status(404).send({ message: "No patient found!" });
    }

    return res.status(200).send({ patient });
  } catch (error) {
    return res.status(500).send({
      message: "Some error occurred while processing request.",
      error: error.message,
    });
  }
});

router.put("/update-patient/:id", async (req, res) => {
  const patientId = req.params.id;

  if (!mongoose.isValidObjectId(patientId)) {
    return res.status(400).send({ message: "Invalid Patient ID!" });
  }

  try {
    const patientExists = await Doctor.findById(patientId);

    if (!patientExists) {
      return res
        .status(404)
        .send({ message: "Patient with this ID not found!" });
    }

    const isValid = validatePatientFields(req.body, "update");

    if (isValid) {
      let { body } = req;

      const updateObject = {
        ...body,
      };

      try {
        const result = await Patient.findByIdAndUpdate(
          patientId,
          updateObject,
          {
            new: true,
          }
        );

        let resp;

        try {
          resp = await result.populate({
            path: "patientAccount",
            select: "-password -_id",
            populate: { path: "role", select: "-_id" },
          });
        } catch (error) {
          resp = result;
        }

        return res.status(201).send({
          message: "Patient updated successfully!",
          updatedPatient: resp,
        });
      } catch (error) {
        return res.status(500).send({
          message: "Some error occurred while processing request!",
          error: error.message,
        });
      }
    }
  } catch (error) {
    return res.status(500).send({
      message: "Some error occurred while processing request!",
      error: error.message,
    });
  }
});

router.delete("/remove-patient/:id", async (req, res) => {
  const patientId = req.params.id;

  if (!mongoose.isValidObjectId(patientId)) {
    return res.status(400).send({ message: "Invalid object ID!" });
  }

  try {
    let result = await Patient.findByIdAndRemove(patientId);

    if (!result) {
      return res
        .status(404)
        .send({ message: "No patient found with provided ID!" });
    }

    let resp;

    try {
      resp = await result.populate({
        path: "patientAccount",
        populate: { path: "role" },
      });
    } catch (error) {
      resp = result;
    }

    return res
      .status(200)
      .send({ message: "Patient removed successfully!", removedPatient: resp });
  } catch (error) {
    return res.status(500).send({
      message: "Some error occurred while processing request!",
      error: error.message,
    });
  }
});

module.exports = router;
