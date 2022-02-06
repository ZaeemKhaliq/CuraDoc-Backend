const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { Patient } = require("../model/patient");

router.get("/getAll", async (req, res) => {
  try {
    const patients = await Patient.find();

    if (!patients) {
      return res.status(404).send({ message: "No patients found!" });
    }

    res.status(200).send(patients);
  } catch (err) {
    res.status(500).send({ message: "Server error!", error: err });
  }
});

module.exports = router;
