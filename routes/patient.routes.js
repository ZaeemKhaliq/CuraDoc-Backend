const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { Patient } = require("../model/patient");

const ErrorHandler = require("../classes/ErrorHandler");

const { validatePatientFields } = require("../helpers/fieldsValidator");

router.get("/get/all", async (req, res) => {
  try {
    const patients = await Patient.find();

    if (!patients) {
      return res.status(404).send({ message: "No patients found!" });
    }

    return res.status(200).send(patients);
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

router.get("/get/one/:id", async (req, res) => {
  const patientId = req.params.id;

  if (!mongoose.isValidObjectId(patientId)) {
    return res.status(400).send({ message: "Invalid Patient ID!" });
  }

  try {
    const patient = Patient.findById(patientId);

    if (!patient) {
      return res.status(404).send({ message: "No patient found!" });
    }

    return res.status(200).send({ patient });
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

router.put("/update-patient/:id", async (req, res) => {
  const patientId = req.params.id;

  if (!mongoose.isValidObjectId(patientId)) {
    return res.status(400).send({ message: "Invalid Patient ID!" });
  }

  try {
    const patientExists = await Patient.findById(patientId);

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
            runValidators: true,
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
  const { id: patientId } = req.params;

  if (!mongoose.isValidObjectId(patientId)) {
    return res.status(400).send({ message: "Invalid Patient ID!" });
  }

  try {
    const patientExists = await Patient.findById(patientId);

    if (!patientExists) {
      return res
        .status(404)
        .send({ message: "Patient with this ID not found!" });
    }

    const isValid = validatePatientFields(req.body, "sendbird-update");

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
      const result = await Patient.findByIdAndUpdate(patientId, updateObject, {
        new: true,
      }).select("-patientAccount");

      return res.status(201).send({
        message: "Patient updated successfully!",
        updatedPatient: result,
      });
    } catch (error) {
      return ErrorHandler.onCatchResponse({ res, error });
    }
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
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
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

module.exports = router;
