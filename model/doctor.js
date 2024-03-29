const mongoose = require("mongoose");
const { User } = require("./user");

const domainExperienceValues = [
  ...new Array(12)
    .fill(0)
    .map((item, index) => `${index + 1} MONTH${index > 0 ? "S" : ""}`),
  ...new Array(31)
    .fill(0)
    .map(
      (item, index) =>
        `${index === 30 ? ">30" : index + 1} YEAR${index > 0 ? "S" : ""}`
    ),
];

const reportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patient",
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

const doctorSchema = new mongoose.Schema({
  doctorAccount: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  professionalDetails: {
    qualification: {
      type: String,
      uppercase: true,
    },
    certificate: {
      type: String,
    },
    domainExperience: {
      type: String,
      uppercase: true,
      enum: {
        values: [...domainExperienceValues],
        message: `{VALUE} is not supported. Accepted values are: ${domainExperienceValues.join(
          ", "
        )}`,
      },
    },
    introduction: {
      type: String,
    },
  },
  clinics: [
    {
      name: {
        type: String,
      },
      location: {
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
      availability: [
        {
          day: {
            type: String,
          },
          time: [
            {
              from: {
                type: String,
              },
              till: {
                type: String,
              },
              _id: false,
            },
          ],
          type: {
            type: String,
            uppercase: true,
            enum: {
              values: ["ONSITE", "ONLINE", "HOMEVISIT"],
              message: `{VALUE} is not supported. Accepted values are: 'ONSITE', 'ONLINE' and 'HOMEVISIT'`,
            },
          },

          _id: false,
        },
      ],
      appointmentFee: {
        type: Number,
      },
      _id: false,
    },
  ],
  personalDetails: {
    profilePicture: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
    gender: {
      type: String,
    },
    cnicNum: {
      type: String,
    },
    phoneNum: {
      type: String,
    },
  },
  ratings: [
    {
      patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "patient",
      },
      rating: {
        type: Number,
      },
      testimonial: {
        type: String,
      },
      _id: false,
    },
  ],
  currentStatus: {
    type: String,
    uppercase: true,
    enum: {
      values: ["ONLINE", "OFFLINE"],
      message: `{VALUE} is not supported. Accepted values are: ONLINE, OFFLINE`,
    },
  },
  verified: {
    type: Boolean,
    default: false,
  },
  sendbirdDetails: {
    userId: {
      type: String,
      default: "",
    },
  },
  reports: [reportSchema],
});

reportSchema.set("toJSON", {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

doctorSchema.set("toJSON", {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

doctorSchema.statics.findByEmail = function (email, callback) {
  const query = this.findOne();

  User.findOne({ email: email }, function (err, user) {
    if (err) {
      query.where({ doctorAccount: null }).exec(callback);
      return query;
    }

    if (!user) {
      query.where({ doctorAccount: null }).exec(callback);
    } else {
      query
        .where({ doctorAccount: user._id })
        .populate({
          path: "doctorAccount",
          select: "-_id",
          populate: { path: "role", select: "-_id" },
        })
        .exec(callback);
    }
  });

  return query;
};

exports.Doctor = mongoose.model("doctor", doctorSchema);
