const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const ErrorHandler = require("../classes/ErrorHandler");

const { Role } = require("../model/role");

router.get("/get/all", async (req, res) => {
  try {
    const roles = await Role.find();

    if (!roles) {
      return res.status(404).send({ message: "No roles found!" });
    }

    res.status(200).send(roles);
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

router.get("/get/one", async (req, res) => {
  let { role } = req.query;

  if (!role) {
    return res.status(400).send({
      message:
        "'role' parameter not found in request! Try making request like this: /get/one?role=<your_role>",
    });
  }

  try {
    let getRole = await Role.findOne({ name: role });

    if (!getRole) {
      return res.status(404).send({ message: "No such role found!" });
    }

    res.status(200).send(getRole);
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

router.post("/add-role", async (req, res) => {
  const { role } = req.body;
  try {
    const roleExists = await Role.findOne({ name: role });
    if (roleExists) {
      return res.status(403).send({ message: "Role already exists!" });
    }

    try {
      const result = await Role.create({ name: role });

      return res
        .status(201)
        .send({ message: "Role added successfully!", addedRole: result });
    } catch (error) {
      return ErrorHandler.onCatchResponse({ res, error });
    }
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

module.exports = router;
