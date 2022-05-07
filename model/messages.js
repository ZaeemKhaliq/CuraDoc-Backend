const mongoose = require("mongoose");

const { Doctor } = require("./doctor");
const { Patient } = require("./patient");

const messagesSchema = new mongoose.Schema(
  {
    authorRole: {
      type: String,
      required: true,
      lowercase: true,
      enum: {
        values: ["doctor", "patient"],
        message: `{VALUE} is not supported. Accepted values are: 'doctor' and 'user'`,
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "authorRole",
    },
    message: {
      type: String,
    },
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Doctor's account is required to create message session"],
    ref: "doctor",
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "User's account is required to create messag session"],
    ref: "patient",
  },
  messages: [messagesSchema],
});

messagesSchema.pre("validate", async function (next) {
  const givenRole = this.authorRole;

  let fetchedRole = await Doctor.findById(this.author)
    .select("doctorAccount -_id")
    .populate({
      path: "doctorAccount",
      select: "role -_id",
      populate: { path: "role", select: "name -_id" },
    });

  if (!fetchedRole) {
    fetchedRole = await Patient.findById(this.author)
      .select("patientAccount -_id")
      .populate({
        path: "patientAccount",
        select: "role -_id",
        populate: { path: "role", select: "name -_id" },
      });

    fetchedRole = fetchedRole.patientAccount.role.name;
  } else {
    fetchedRole = fetchedRole.doctorAccount.role.name;
  }

  if (fetchedRole && fetchedRole.toLowerCase() !== givenRole) {
    this.authorRole = fetchedRole;
  }

  next();
});

exports.Message = mongoose.model("message", messageSchema);
