const mongoose = require("mongoose");

const { Doctor } = require("./doctor");
const { Patient } = require("./patient");

const conversationSchema = new mongoose.Schema(
  {
    authorRole: {
      type: String,
      required: true,
      lowercase: true,
      enum: {
        values: ["doctor", "patient"],
        message: `{VALUE} is not supported. Accepted values are: 'doctor' and 'patient'`,
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

const appointmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Patient's account is required to save appointment"],
      ref: "patient",
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Doctor's account is required to save appointment"],
      ref: "doctor",
    },
    requestDetails: {
      patientMatter: {
        type: String,
      },
      appointmentType: {
        type: String,
        uppercase: true,
        enum: {
          values: ["ONSITE", "ONLINE", "HOMEVISIT"],
          message: `{VALUE} is not supported. Accepted values are: 'ONSITE', 'ONLINE' and 'HOMEVISIT'`,
        },
      },
      patientAddress: {
        type: String,
      },
    },
    responseDetails: {
      accepted: {
        type: Boolean,
      },
      message: {
        type: String,
      },
      date: {
        type: String,
      },
      day: {
        type: String,
      },
      time: {
        type: String,
      },
      appointmentType: {
        type: String,
        uppercase: true,
        enum: {
          values: ["ONSITE", "ONLINE", "HOMEVISIT"],
          message: `{VALUE} is not supported. Accepted values are: 'ONSITE', 'ONLINE' and 'HOMEVISIT'`,
        },
      },
    },
    active: {
      type: Boolean,
    },
    completed: {
      type: Boolean,
    },
    result: {
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
    conversation: [conversationSchema],
  },
  { timestamps: true }
);

appointmentSchema.set("toJSON", {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

conversationSchema.set("toJSON", {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

conversationSchema.pre("validate", async function (next) {
  const givenRole = this.authorRole;

  let fetchedRole = await Doctor.findById(this.author)
    .select("doctorAccount -_id")
    .populate({
      path: "doctorAccount",
      select: "role -_id",
      populate: { path: "role", select: "name -_id" },
    });

  if (!fetchedRole) {
    fetchedRole = await await Patient.findById(this.author)
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

  if (fetchedRole && fetchedRole.toLowerCase() === givenRole) {
    next();
  } else if (fetchedRole && fetchedRole.toLowerCase() !== givenRole) {
    this.authorRole = fetchedRole;
    next();
  }

  next();
});

exports.Appointment = mongoose.model("appointment", appointmentSchema);
exports.Conversation = mongoose.model("conversation", conversationSchema);
