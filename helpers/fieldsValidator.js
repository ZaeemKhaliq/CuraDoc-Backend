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
    "introduction",
    "currentStatus",
    "verified",
  ];

  let isValid = true;
  const validFieldsForUpdate = validFields.slice(1, validFields.length);
  const validFieldsForVerify = validFields.slice(validFields.length - 1);

  suppliedProperties.forEach((item) => {
    if (flag === "add") {
      if (!validFields.includes(item)) {
        isValid = false;
      }
    } else if (flag === "update") {
      if (!validFieldsForUpdate.includes(item)) {
        isValid = false;
      }
    } else if (flag === "verify") {
      if (!validFieldsForVerify.includes(item)) {
        isValid = false;
      }
    } else {
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
    "name",
    "requestDetails",
    "patientMatter",
    "appointmentType",
    "patientAddress",
    "patientPhoneNum",
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

  const validFieldsForAdd = validFields.slice(0, 8);
  let isValid = true;

  suppliedProperties.forEach((item) => {
    if (flag === "add") {
      if (!validFieldsForAdd.includes(item)) {
        isValid = false;
      }
    } else if (flag === "update") {
      if (!validFields.includes(item, 2)) {
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

function validateUserFields(data) {
  const suppliedProperties = getObjectProperties(data);

  const validFields = ["name"];

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
exports.validateUserFields = validateUserFields;
