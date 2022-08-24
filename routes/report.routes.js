const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const { Report } = require("../model/report");

const ErrorHandler = require("../classes/ErrorHandler");

const { validateReportFields } = require("../helpers/fieldsValidator");

router.get("/get/all", async (req, res) => {
  try {
    const reports = await Report.find();

    if (!reports) {
      return res.status(404).send({ message: "No reports found!" });
    }

    return res.status(200).send(reports);
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

router.get("/get/one/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).send({ message: "Invalid report ID" });
  }

  try {
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).send({ message: "No report found!" });
    }

    return res.status(200).send(report);
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

router.get("/get/by-doctorId/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).send({ message: "Invalid report ID" });
  }

  try {
    const doctor = await Report.findOne({ doctor: id });

    if (!doctor) {
      return res.status(404).send({ message: "No doctor found!" });
    }

    return res.status(200).send(doctor);
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

router.get("/get/by-patientId/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).send({ message: "Invalid report ID" });
  }

  try {
    const patient = await Report.findOne({ patient: id });

    if (!patient) {
      return res.status(404).send({ message: "No patient found!" });
    }

    return res.status(200).send(patient);
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

router.post("/add-report", async (req, res) => {
  const { body } = req;

  const isValid = validateReportFields(body, "add");
  if (!isValid) {
    return res.status(400).send({
      message:
        "Request declined! Some or all properties in the 'body' are invalid or not supported!",
    });
  }

  try {
    const newReport = new Report({ ...body });

    const result = await newReport.save();

    return res
      .status(201)
      .send({ message: "Report added successfully!", addedReport: result });
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

router.put("/update-report/:id", async (req, res) => {
  const { body } = req;
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).send({ message: "Invalid report ID" });
  }

  const isValid = validateReportFields(body, "update");
  if (!isValid) {
    return res.status(400).send({
      message:
        "Request declined! Some or all properties in the 'body' are invalid or not supported!",
    });
  }

  try {
    const reportExists = await Report.findById(id);
    if (!reportExists) {
      return res
        .status(404)
        .send({ message: "No report with given ID exists!" });
    }

    const result = await Report.findByIdAndUpdate(id, body, { new: true });

    return res
      .status(201)
      .send({ message: "Report updated successfully!", updatedReport: result });
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

router.delete("/delete-report/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).send({ message: "Invalid report ID" });
  }

  try {
    const reportExists = await Report.findById(id);
    if (!reportExists) {
      return res
        .status(404)
        .send({ message: "No report with given ID exists!" });
    }

    await Report.findByIdAndDelete(id);

    return res.status(200).send({ message: "Report deleted successfully!" });
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

module.exports = router;
