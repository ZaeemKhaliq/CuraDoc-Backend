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
  paymentDetails: {
    creditCards: [
      {
        number: {
          type: Number,
          validate: {
            validator: function (value) {
              return String(value).length === 16;
            },
            message: "The card number should be of 16 characters",
          },
        },
        expiry: {
          type: String,
          validate: {
            validator: function (value) {
              const regex = /^([0]?[1-9]?|[1]?[1-2])\/[0-9]{2}$/;
              return !value || regex.test(value);
            },
            message:
              "Invalid format for card's expiry date. The correct format is MM/YY",
          },
        },
        cvc: {
          type: Number,
        },
      },
    ],
  },
  appointmentHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appointment",
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
