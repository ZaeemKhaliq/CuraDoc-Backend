const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const ErrorHandler = require("../classes/ErrorHandler");

const { Appointment } = require("../model/appointment");
const { Doctor } = require("../model/doctor");
const { Patient } = require("../model/patient");

const {
  validateAppointmentFields,
  validateConversationFields,
} = require("../helpers/fieldsValidator");

router.get("/get/all", async (req, res) => {
  try {
    const appoinments = await Appointment.find();

    if (!appoinments) {
      return res.status(404).send({ message: "No appointments in records!" });
    }

    return res.status(200).send(appoinments);
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

router.get("/get/one/:id", async (req, res) => {
  const { id: appointmentId } = req.params;

  if (!mongoose.isValidObjectId(appointmentId)) {
    return res.status(400).send({ message: "Invalid Appointment ID!" });
  }

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res
        .status(404)
        .send({ message: "No appointment with given ID found!" });
    }

    return res.status(200).send(appointment);
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

// APPOINTMENTS OF A PATIENT
router.get("/get/by-patientId/:id", async (req, res) => {
  const { id: patientId } = req.params;

  if (!mongoose.isValidObjectId(patientId)) {
    return res.status(400).send({ message: "Invalid Appointment ID!" });
  }

  try {
    const appointments = await Appointment.find({
      patient: patientId,
    }).populate([
      {
        path: "patient",
        populate: { path: "patientAccount", select: "-password -role -_id" },
      },
      {
        path: "doctor",
        populate: { path: "doctorAccount", select: "-password -role -_id" },
      },
    ]);

    if (!appointments) {
      return res
        .status(404)
        .send({ message: "No appointments with given ID found in records!" });
    }

    return res.status(200).send(appointments);
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

// APPOINTMENTS OF A DOCTOR
router.get("/get/by-doctorId/:id", async (req, res) => {
  const { id: doctorId } = req.params;

  if (!mongoose.isValidObjectId(doctorId)) {
    return res.status(400).send({ message: "Invalid Appointment ID!" });
  }

  try {
    const appointments = await Appointment.find({ doctor: doctorId }).populate([
      {
        path: "patient",
        populate: { path: "patientAccount", select: "-password -role -_id" },
      },
      {
        path: "doctor",
        populate: { path: "doctorAccount", select: "-password -role -_id" },
      },
    ]);

    if (!appointments) {
      return res
        .status(404)
        .send({ message: "No appointments with given ID found in records!" });
    }

    return res.status(200).send(appointments);
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

router.get("/get/count/by-doctorId/:id", async (req, res) => {
  const { id: doctorId } = req.params;

  if (!mongoose.isValidObjectId(doctorId)) {
    return res.status(400).send({ message: "Invalid Appointment ID!" });
  }

  try {
    const count = await Appointment.find({ doctor: doctorId }).countDocuments();

    return res.status(200).send({ count });
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

// ADD APPOINTMENT API
router.post("/add-appointment", async (req, res) => {
  const { body } = req;

  const isValid = validateAppointmentFields(body, "add");
  if (!isValid) {
    return res.status(400).send({
      message:
        "Request declined! Some or all properties in the 'body' are invalid or not supported!",
    });
  }

  try {
    let newAppointment = new Appointment({
      ...body,
    });
    const result = await newAppointment.save();

    let resp;

    try {
      resp = await result.populate([
        {
          path: "patient",
          select: "-_id",
          populate: {
            path: "patientAccount",
            select: "-password -_id",
            populate: {
              path: "role",
              select: "-_id",
            },
          },
        },
        {
          path: "doctor",
          select: "-_id",
          populate: {
            path: "doctorAccount",
            select: "-password -_id",
            populate: {
              path: "role",
              select: "-_id",
            },
          },
        },
      ]);
    } catch (error) {
      resp = result;
    }

    return res.status(201).send({
      message: "Appointment added successfully!",
      addedAppointment: resp,
    });
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

// UPDATE APPOINTMENT API
router.put("/update-appointment/:id", async (req, res) => {
  const { id: appointmentId } = req.params;
  const { body } = req;

  if (!mongoose.isValidObjectId(appointmentId)) {
    return res.status(400).send({ message: "Invalid Appointment ID!" });
  }

  const isValid = validateAppointmentFields(body, "update");
  if (!isValid) {
    return res.status(400).send({
      message:
        "Request declined! Some or all properties in the 'body' are invalid or not supported!",
    });
  }

  try {
    const appointmentExists = await Appointment.findById(appointmentId);

    if (!appointmentExists) {
      return res
        .status(404)
        .send({ message: "No appointment with given ID was found!" });
    }

    try {
      const result = await Appointment.findByIdAndUpdate(appointmentId, body, {
        new: true,
      });

      let resp;

      try {
        resp = await result.populate([
          {
            path: "patient",
            populate: {
              path: "patientAccount",
              select: "-password",
              populate: {
                path: "role",
              },
            },
          },
          {
            path: "doctor",
            populate: {
              path: "doctorAccount",
              select: "-password",
              populate: {
                path: "role",
              },
            },
          },
        ]);
      } catch (error) {
        resp = result;
      }

      return res.status(201).send({
        message: "Appointment Updated successfully!",
        updatedAppointment: resp,
      });
    } catch (error) {
      return ErrorHandler.onCatchResponse({ res, error });
    }
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

// UPDATE APPOINTMENT'S CONVERSATION API
router.put("/update-appointment/conversation/:id", async (req, res) => {
  const { id: appointmentId } = req.params;
  const { body } = req;

  if (!mongoose.isValidObjectId(appointmentId)) {
    return res.status(400).send({ message: "Invalid Appointment ID!" });
  }

  const isValid = validateConversationFields(body);
  if (!isValid) {
    return res.status(400).send({
      message:
        "Request declined! Some or all properties in the 'body' are invalid or not supported!",
    });
  }

  try {
    const appointmentExists = await Appointment.findById(appointmentId);

    if (!appointmentExists) {
      return res
        .status(404)
        .send({ message: "No appointment with given ID was found!" });
    }

    const authorId = body.conversation[0].author;
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
        if (authorId !== String(appointmentExists.patient)) {
          return res.status(400).send({
            message:
              "The patient ID given does not belong to this appointment!",
          });
        }
      } else if (role.toLowerCase() === "doctor") {
        if (authorId !== String(appointmentExists.doctor)) {
          return res.status(400).send({
            message: "The doctor ID given does not belong to this appointment!",
          });
        }
      }
    } catch (error) {
      return ErrorHandler.onCatchResponse({ res, error });
    }

    const { conversation } = body;

    appointmentExists.conversation.push(...conversation);

    try {
      const result = await appointmentExists.save();

      let resp;

      try {
        resp = await Appointment.populate(result.conversation, {
          path: "author",
          select: "doctorAccount patientAccount -_id",
          populate: {
            path: "doctorAccount patientAccount",
            select: "name email -_id",
            strictPopulate: false,
          },
        });
      } catch (error) {
        resp = result.conversation;
      }

      return res.status(201).send({
        message: "Conversation updated successfully!",
        updatedConversation: resp,
      });
    } catch (error) {
      return ErrorHandler.onCatchResponse({ res, error });
    }
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

router.delete("/delete-appointment/:id", async (req, res) => {
  const { id: appointmentId } = req.params;

  if (!mongoose.isValidObjectId(appointmentId)) {
    return res.status(400).send({ message: "Invalid Appointment ID!" });
  }

  try {
    await Appointment.findByIdAndRemove(appointmentId);

    return res
      .status(200)
      .send({ message: "Appointment deleted successfully!" });
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

module.exports = router;
