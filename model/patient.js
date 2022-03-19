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
      type: String,
    },
  },
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
