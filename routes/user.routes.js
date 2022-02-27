const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { hashSync, compareSync } = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../model/user");
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
    res.status(500).send({ message: "Server error!", error: err });
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

    let getRole;

    try {
      const roleExists = await Role.findOne({ name: role });

      if (!roleExists) {
        return res.status(404).send({ message: "Role doesn't exists!" });
      }

      console.log("Fetched role:", roleExists);

      getRole = roleExists.id;
    } catch (err) {
      return res.status(500).send({ message: "Server error!", error: err });
    }

    let user = new User({
      name,
      email,
      password: hashSync(password, 10),
      role: getRole,
    });

    try {
      const result = await user.save();

      if (!result) {
        return res
          .status(500)
          .send({ message: "Some error occurred while creating user!" });
      }

      res
        .status(201)
        .send({ message: "User added successfully!", user: result });
    } catch (err) {
      return res.status(500).send({ message: "Server error!", error: err });
    }
  } catch (err) {
    return res.status(500).send({ message: "Server error!", error: err });
  }
});

router.post("/login", async (req, res) => {
  let { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email }).populate("role");

    if (!user) {
      return res
        .status(404)
        .send({ message: "User with this email not found!" });
    }

    if (user && compareSync(password, user.password)) {
      const SECRET_KEY = process.env.SECRET_KEY;

      const token = jwt.sign(
        {
          userId: user.id,
        },
        SECRET_KEY,
        {
          expiresIn: "5d",
        }
      );

      return res.status(200).send({
        user: {
          email: user.email,
          name: user.name,
          role: user.role,
          userId: user.id,
        },
        token: token,
      });
    } else {
      return res
        .status(404)
        .send({ message: "You have entered wrong password!" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Server error!", error: err });
  }
});

module.exports = router;
