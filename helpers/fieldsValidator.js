const { getObjectProperties } = require("../utils/getObjectProperties");

function validateDoctorFields(data, flag) {
  const suppliedProperties = getObjectProperties(data);

  const validFields = [
    "doctorAccount",
    "professionalDetails",
    "qualification",
    "certificate",
    "domainExperience",
    "clinics",
    "name",
    "location",
    "city",
    "town",
    "neighbourhood",
    "street",
    "availability",
    "day",
    "time",
    "from",
    "till",
    "type",
    "personalDetails",
    "profilePicture",
    "dateOfBirth",
    "cnicNum",
    "phoneNum",
    "currentStatus",
    "verified",
  ];

  let isValid = true;

  suppliedProperties.forEach((item) => {
    // For updating, 'doctorAccount' is not required, so we start from 1 index
    if (!validFields.includes(item, flag === "add" ? 0 : 1)) {
      isValid = false;
    }
  });

  return isValid;
}

function validatePatientFields(data, flag) {
  const suppliedProperties = getObjectProperties(data);

  const validFields = [
    "patientAccount",
    "personalDetails",
    "profilePicture",
    "dateOfBirth",
    "cnicNum",
    "phoneNum",
    "address",
    "city",
    "town",
    "neighbourhood",
    "street",
  ];

  let isValid = true;

  suppliedProperties.forEach((item) => {
    if (flag === "add") {
      if (!validFields.includes(item)) {
        isValid = false;
      }
    } else if (flag === "update") {
      if (!validFields.includes(item, 1)) {
        isValid = false;
      }
    } else {
      isValid = false;
    }
  });

  return isValid;
}

function validateAppointmentFields(data, flag) {
  const suppliedProperties = getObjectProperties(data);

  const validFields = [
    "patient",
    "doctor",
    "requestDetails",
    "patientMatter",
    "appointmentType",
    "patientAddress",
    "responseDetails",
    "accepted",
    "message",
    "date",
    "day",
    "time",
    "active",
    "completed",
    "active",
    "completed",
    "result",
    "doctorAdvice",
    "prescriptions",
    "drugName",
    "intake",
    "duration",
  ];

  let isValid = true;

  suppliedProperties.forEach((item) => {
    if (flag === "add") {
      if (!validFields.includes(item)) {
        isValid = false;
      }
    } else if (flag === "update") {
      if (!validFields.includes(item, 1)) {
        isValid = false;
      }
    } else {
      isValid = false;
    }
  });

  return isValid;
}

function validateConversationFields(data) {
  const suppliedProperties = getObjectProperties(data);

  const validFields = ["conversation", "message", "author", "authorRole"];

  let isValid = true;

  suppliedProperties.forEach((item) => {
    if (!validFields.includes(item)) {
      isValid = false;
    }
  });

  return isValid;
}

exports.validateDoctorFields = validateDoctorFields;
exports.validatePatientFields = validatePatientFields;
exports.validateAppointmentFields = validateAppointmentFields;
exports.validateConversationFields = validateConversationFields;
