const mongoose = require("mongoose");

const reportsSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patient",
    },
    openedBy: {
      type: String,
      enum: {
        values: ["patient", "doctor"],
        message:
          "{VALUE} is not supported. Acceptable values are 'patient' and 'doctor'",
      },
    },
    problemType: {
      type: String,
    },
    problemDescription: {
      type: String,
    },
    fileAsProof: {
      type: String,
    },
  },
  { timestamps: true }
);

exports.Report = mongoose.model("report", reportsSchema);
