const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { hashSync, compareSync } = require("bcrypt");
const jwt = require("jsonwebtoken");

const ErrorHandler = require("../classes/ErrorHandler");

const { User } = require("../model/user");
const { Doctor } = require("../model/doctor");
const { Patient } = require("../model/patient");
const { Role } = require("../model/role");

const { validateUserFields } = require("../helpers/fieldsValidator");

//API FOR GETTING ALL USERS
router.get("/get/all", async (req, res) => {
  try {
    const users = await User.find();

    if (!users) {
      return res.status(404).send({ message: "No users found!" });
    }

    res.status(200).send(users);
  } catch (err) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

// API FOR GETTING USERS BY ROLE
router.get("/get/by-role", async (req, res) => {
  const { role } = req.body;

  try {
    const fetchedRole = await Role.findOne({ name: role });

    if (!fetchedRole) {
      return res.status(404).send({ message: "Role doesn't exists!" });
    }

    const roleId = fetchedRole.id;

    try {
      const users = await User.find({ role: roleId });

      if (!users) {
        return res
          .status(404)
          .send({ message: "No user with this role found!" });
      }

      return res.status(200).send(users);
    } catch (error) {
      return ErrorHandler.onCatchResponse({ res, error });
    }
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

// API FOR GETTING SINGLE USER BY HIS/HER EMAIL
router.get("/get/by-email", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).send({
      message:
        "'email' parameter not found in request! Try making request like this: /get/by-email?email=<your_email>",
    });
  }

  try {
    const user = await User.findOne({ email: email })
      .select("-password")
      .populate({
        path: "role",
        select: "name -_id",
      });

    if (!user) {
      return res
        .status(404)
        .send({ message: "No user with given email found in records!" });
    }
    return res.status(200).send(user);
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

//USER REGISTRATION API
router.post("/register", async (req, res) => {
  let { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email: email });

    if (userExists) {
      return res.status(403).send({
        message: "Email not available! Try a different Email address",
      });
    }

    let roleObject;

    try {
      const roleExists = await Role.findOne({ name: role });

      console.log("Fetched role:", roleExists);

      if (!roleExists) {
        return res.status(404).send({ message: "Role doesn't exists!" });
      }

      roleObject = roleExists;
    } catch (error) {
      return ErrorHandler.onCatchResponse({ res, error });
    }

    let user = new User({
      name,
      email,
      password: hashSync(password, 10),
      role: roleObject.id,
    });

    try {
      const result = await user.save();

      if (roleObject.name === "Doctor") {
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
          return ErrorHandler.onCatchResponse({
            res,
            error,
            message:
              "User added but some error occurred while adding user as a doctor!",
          });
        }
      } else if (roleObject.name === "Patient") {
        try {
          let newPatient = new Patien({
            patientAccount: result.id,
          });

          const patientResult = await newPatient.save();
          let finalResp;

          try {
            finalResp = await patientResult.populate({
              path: "patientAccount",
              select: "-password -_id",
              populate: { path: "role", select: "-_id" },
            });
          } catch (error) {
            finalResp = patientResult;
          }

          return res
            .status(201)
            .send({ message: "User added successfully!", user: finalResp });
        } catch (error) {
          return ErrorHandler.onCatchResponse({
            res,
            error,
            message:
              "User added but some error occurred while adding user as a patient!",
          });
        }
      }
    } catch (error) {
      return ErrorHandler.onCatchResponse({ res, error });
    }
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

// USER LOGIN API
router.post("/login", async (req, res) => {
  let { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email }).populate({
      path: "role",
      select: "name -_id",
    });

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
          role: user.role.name,
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
          }).select("-doctorAccount");

          return res.status(200).send({
            ...responseObject,
            user: {
              ...responseObject.user,
              doctorProfile: doctorExists,
            },
          });
        } catch (error) {
          return ErrorHandler.onCatchResponse({ res, error });
        }
      } else if (user.role.name === "Patient") {
        try {
          const patientExists = await Patient.findOne({
            patientAccount: user.id,
          }).select("-patientAccount");

          return res.status(200).send({
            ...responseObject,
            user: {
              ...responseObject.user,
              patientProfile: patientExists,
            },
          });
        } catch (error) {
          return ErrorHandler.onCatchResponse({ res, error });
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
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

// USER NAME UPDATE API
router.put("/update-user/:id", async (req, res) => {
  const userId = req.params.id;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).send({ message: "Invalid User ID!" });
  }

  try {
    const userExists = await User.findById(userId);

    if (!userExists) {
      return res.status(404).send({ message: "User with this ID not found!" });
    }

    const isValid = validateUserFields(req.body);

    if (!isValid) {
      return res.status(400).send({
        message:
          "Request declined! Some or all properties in the 'body' are invalid or not supported!",
      });
    }

    const updateObject = {
      ...req.body,
    };

    try {
      const result = await User.findByIdAndUpdate(userId, updateObject, {
        new: true,
      }).select("-password");

      let resp;

      try {
        resp = await result.populate({
          path: "role",
          select: "name -_id",
        });
      } catch (error) {
        resp = result;
      }

      return res.status(201).send({
        message: "User updated successfully!",
        updatedUser: {
          name: resp.name,
          role: {
            name: resp.role.name,
          },
          email: resp.email,
          userId: resp.id,
        },
      });
    } catch (error) {
      return ErrorHandler.onCatchResponse({ res, error });
    }
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

module.exports = router;
