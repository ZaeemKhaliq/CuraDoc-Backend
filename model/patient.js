const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Patient name is required!"],
    ref: "user",
  },
  dateOfBirth: {
    type: String,
  },
  latestAppointment: {
    date: {
      type: String,
    },
    type: {
      type: String,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
    },
  },
  numberOfAppointments: {
    type: Number,
  },
  appointmentsHistory: [
    {
      date: {
        type: String,
      },
      type: {
        type: String,
      },
      doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "doctor",
      },
      status: {
        type: String,
      },
    },
  ],
});

patientSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

patientSchema.set("toJSON", {
  virtuals: true,
});

exports.Patient = mongoose.model("patient", patientSchema);
