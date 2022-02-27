const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { hashSync, compareSync } = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../model/user");
const { Doctor } = require("../model/doctor");
const { Patient } = require("../model/patient");
const { Role } = require("../model/role");

//API FOR GETTING ALL USERS
router.get("/getAll", async (req, res) => {
  try {
    const users = await User.find();

    if (!users) {
      return res.status(404).send({ message: "No users found!" });
    }

    res.status(200).send(users);
  } catch (err) {
    res.status(500).send({ message: "Server error!", error: err.message });
  }
});

//USER REGISTRATION API
router.post("/register", async (req, res) => {
  let { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email: email });

    if (userExists) {
      return res.status(403).send({ message: "User Already Exists!" });
    }

    let roleObject;

    try {
      const roleExists = await Role.findOne({ name: role });

      if (!roleExists) {
        return res.status(404).send({ message: "Role doesn't exists!" });
      }

      console.log("Fetched role:", roleExists);

      roleObject = roleExists;
    } catch (err) {
      return res
        .status(500)
        .send({ message: "Server error!", error: err.message });
    }

    let user = new User({
      name,
      email,
      password: hashSync(password, 10),
      role: roleObject.id,
    });

    try {
      const result = await user.save();

      if (!result) {
        return res
          .status(500)
          .send({ message: "Some error occurred while creating user!" });
      }

      let newDoctor = new Doctor({
        doctorAccount: result.id,
      });

      try {
        const doctorResult = await newDoctor.save();
        let finalResp;

        try {
          finalResp = await doctorResult.populate({
            path: "doctorAccount",
            select: "-password -_id",
            populate: { path: "role", select: "-_id" },
          });
        } catch (error) {
          finalResp = doctorResult;
        }

        return res
          .status(201)
          .send({ message: "User added successfully!", user: finalResp });
      } catch (error) {
        return res.status(500).send({
          message:
            "User added but some error occurred while adding user as a doctor!",
          error: error.message,
        });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: "Server error!", error: err.message });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ message: "Server error!", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  let { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email }).populate("role");

    if (!user) {
      return res
        .status(404)
        .send({ message: "Invalid email and password combination!" });
    }

    if (user && compareSync(password, user.password)) {
      const SECRET_KEY = process.env.SECRET_KEY;

      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
        },
        SECRET_KEY,
        {
          expiresIn: "5d",
        }
      );

      let responseObject = {
        user: {
          email: user.email,
          name: user.name,
          role: user.role,
          userId: user.id,
        },
        token: token,
      };

      if (user.role.name === "Doctor") {
        try {
          const doctorExists = await Doctor.findOne({
            doctorAccount: user.id,
          }).select("-doctorAccount -_id");

          return res.status(200).send({
            ...responseObject,
            user: {
              ...responseObject.user,
              doctorProfile: doctorExists,
            },
          });
        } catch (error) {
          return res
            .status(500)
            .send({ message: "Some error occurred!", error: error.message });
        }
      } else if (user.role.name === "Patient") {
        try {
          const patientExists = await Patient.findOne({
            patientAccount: user.id,
          }).select("-patientAccount -_id");

          return res.status(200).send({
            ...responseObject,
            user: {
              ...responseObject.user,
              patientProfile: patientExists,
            },
          });
        } catch (error) {
          return res
            .status(500)
            .send({ message: "Some error occurred!", error: error.message });
        }
      } else if (user.role.name === "Admin") {
        return res.status(200).send({
          ...responseObject,
        });
      }
    } else {
      return res
        .status(404)
        .send({ message: "Invalid email and password combination!" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ message: "Server error!", error: err.message });
  }
});

module.exports = router;
