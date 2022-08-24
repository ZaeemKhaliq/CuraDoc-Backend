const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { Message } = require("../model/messages.js");
const { Doctor } = require("../model/doctor");
const { Patient } = require("../model/patient");

const ErrorHandler = require("../classes/ErrorHandler");

const { validateMessagesFields } = require("../helpers/fieldsValidator");

router.get("/get/all", async (req, res) => {
  try {
    const messages = await Message.find();

    if (!messages) {
      return res.status(404).send({ message: "No appointments in records!" });
    }

    return res.status(200).send(messages);
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

router.post("/add-message", async (req, res) => {
  const { body } = req;

  const isValid = validateMessagesFields(body);
  if (!isValid) {
    return res.status(400).send({
      message:
        "Request declined! Some or all properties in the 'body' are invalid or not supported!",
    });
  }

  let newMessage = new Message({
    ...body,
  });

  try {
    const result = await newMessage.save();

    return res.status(201).send({
      message: "Message added successfully!",
      addedMessage: result,
    });
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

router.put("/update-message/:id", async (req, res) => {
  const { id: messageId } = req.params;
  const { body } = req;

  if (!mongoose.isValidObjectId(messageId)) {
    return res.status(400).send({ message: "Invalid Message ID!" });
  }

  const isValid = validateMessagesFields(body);
  if (!isValid) {
    return res.status(400).send({
      message:
        "Request declined! Some or all properties in the 'body' are invalid or not supported!",
    });
  }

  try {
    const messageExists = await Message.findById(messageId);

    if (!messageExists) {
      return res
        .status(404)
        .send({ message: "No appointment with given ID was found!" });
    }

    const authorId = body.messages[0].author;
    let role;
    let authorExists;

    try {
      authorExists = await Patient.findById(authorId)
        .select("patientAccount")
        .populate({
          path: "patientAccount",
          select: "role -_id",
          populate: { path: "role", select: "name -_id" },
        });

      if (!authorExists) {
        authorExists = await Doctor.findById(authorId)
          .select("doctorAccount")
          .populate({
            path: "doctorAccount",
            select: "role -_id",
            populate: { path: "role", select: "name -_id" },
          });

        if (!authorExists) {
          return res
            .status(400)
            .send({ message: "No author with given ID exists!" });
        }

        role = authorExists.doctorAccount.role.name;
      } else {
        role = authorExists.patientAccount.role.name;
      }

      if (role.toLowerCase() === "patient") {
        if (authorId !== String(messageExists.patient)) {
          return res.status(400).send({
            message:
              "The patient ID given does not belong to this appointment!",
          });
        }
      } else if (role.toLowerCase() === "doctor") {
        if (authorId !== String(messageExists.doctor)) {
          return res.status(400).send({
            message: "The doctor ID given does not belong to this appointment!",
          });
        }
      }

      const { messages } = body;

      messageExists.messages.push(...messages);

      try {
        const result = await messageExists.save();

        let resp;

        try {
          resp = await Message.populate(result.messages, {
            path: "author",
            select: "doctorAccount patientAccount -_id",
            populate: {
              path: "doctorAccount patientAccount",
              select: "name email -_id",
              strictPopulate: false,
            },
          });
        } catch (error) {
          resp = result.messages;
        }

        return res.status(201).send({
          message: "Messages updated successfully!",
          updatedMessages: resp,
        });
      } catch (error) {
        return ErrorHandler.onCatchResponse({ res, error });
      }
    } catch (error) {
      return ErrorHandler.onCatchResponse({ res, error });
    }
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

module.exports = router;
