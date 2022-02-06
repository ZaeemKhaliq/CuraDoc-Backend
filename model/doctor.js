const mongoose = require("mongoose");
const { User } = require("./user");

const doctorSchema = new mongoose.Schema({
  doctorAccount: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  qualification: {
    type: String,
    required: true,
    uppercase: true,
    enum: {
      values: ["MBBS", "BDS", "MM", "MD", "BAMS"],
      message: `{VALUE} is not supported. Accepted values are: MBBS, BDS, MM, MD, BAMS`,
    },
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
  availability: [
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
  verified: {
    type: Boolean,
    required: true,
    default: false,
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
