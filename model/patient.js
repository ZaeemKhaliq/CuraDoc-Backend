const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  patientAccount: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Patient's account is required!"],
    ref: "user",
  },
  personalDetails: {
    profilePicture: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
    cnicNum: {
      type: String,
    },
    phoneNum: {
      type: String,
    },
    address: {
      city: {
        type: String,
      },
      town: {
        type: String,
      },
      neighbourhood: {
        type: String,
      },
      street: {
        type: String,
      },
    },
  },
  currentAppointments: [
    {
      date: {
        type: String,
      },
      day: {
        type: String,
      },
      time: {
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
  ],
  numberOfAppointments: {
    type: Number,
  },
  appointmentsHistory: [
    {
      date: {
        type: String,
      },
      day: {
        type: String,
      },
      time: {
        type: String,
      },
      type: {
        type: String,
      },
      doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "doctor",
      },
      result: {
        type: String,
      },
      doctorAdvice: {
        type: String,
      },
      prescriptions: [
        {
          drugName: {
            type: String,
          },
          intake: {
            type: String,
          },
          duration: {
            type: String,
          },
        },
      ],
    },
  ],
});

patientSchema.set("toJSON", {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

exports.Patient = mongoose.model("patient", patientSchema);
