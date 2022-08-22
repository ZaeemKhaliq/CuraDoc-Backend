const { getObjectProperties } = require("../utils/getObjectProperties");

function validateDoctorFields(data, flag) {
  const suppliedProperties = getObjectProperties(data);

  const validFields = [
    ["doctorAccount"],
    [
      "professionalDetails",
      "qualification",
      "certificate",
      "domainExperience",
      "introduction",
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
      "appointmentFee",
      "personalDetails",
      "profilePicture",
      "dateOfBirth",
      "gender",
      "cnicNum",
      "phoneNum",
      "ratings",
      "patient",
      "rating",
      "testimonial",
      "currentStatus",
    ],
    ["sendbirdDetails", "userId"],
    ["verified"],
  ];

  let isValid = true;
  const validFieldsForAdd = validFields.flat();
  const validFieldsForUpdate = validFields[1];
  const validFieldsForSendbirdDetailsUpdate = validFields[2];
  const validFieldsForVerify = validFields[3];

  suppliedProperties.forEach((item) => {
    if (flag === "add") {
      if (!validFieldsForAdd.includes(item)) {
        isValid = false;
      }
    } else if (flag === "update") {
      if (!validFieldsForUpdate.includes(item)) {
        isValid = false;
      }
    } else if (flag === "sendbird-update") {
      if (!validFieldsForSendbirdDetailsUpdate.includes(item)) {
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
    ["patientAccount"],
    [
      "personalDetails",
      "profilePicture",
      "dateOfBirth",
      "cnicNum",
      "gender",
      "phoneNum",
      "address",
      "city",
      "town",
      "neighbourhood",
      "street",
      "paymentDetails",
      "creditCards",
      "number",
      "expiry",
      "cvc",
      "appointmentHistory",
    ],
    ["sendbirdDetails", "userId"],
  ];

  let isValid = true;
  const validFieldsForAdd = validFields.flat();
  const validFieldsForUpdate = validFields[1];
  const validFieldsForSendbirdDetailsUpdate = validFields[2];

  suppliedProperties.forEach((item) => {
    if (flag === "add") {
      if (!validFieldsForAdd.includes(item)) {
        isValid = false;
      }
    } else if (flag === "update") {
      if (!validFieldsForUpdate.includes(item)) {
        isValid = false;
      }
    } else if (flag === "sendbird-update") {
      if (!validFieldsForSendbirdDetailsUpdate.includes(item)) {
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

  const validFieldsForAdd = [
    "patient",
    "doctor",
    "appointmentId",
    "requestDetails",
    "patientMatter",
    "patientAddress",
    "patientPhoneNum",
    "appointmentType",
    "expectedAppointmentDate",
    "payment",
    "appointmentFee",
    "isPaid",
  ];

  const validFieldsForUpdate = [
    "requestDetails",
    "patientMatter",
    "patientAddress",
    "patientPhoneNum",
    "appointmentType",
    "expectedAppointmentDate",
    "responseDetails",
    "message",
    "date",
    "day",
    "time",
    "isPending",
    "isAccepted",
    "isCompleted",
    "isRejected",
    "rejectedReason",
    "result",
    "dateCompleted",
    "doctorAdvice",
    "prescriptions",
    "drugName",
    "drugIntake",
    "drugDuration",
    "patientRating",
    "rating",
    "testimonial",
    "payment",
    "appointmentFee",
    "isPaid",
  ];

  let isValid = true;

  suppliedProperties.forEach((item) => {
    if (flag === "add") {
      if (!validFieldsForAdd.includes(item)) {
        isValid = false;
      }
    } else if (flag === "update") {
      if (!validFieldsForUpdate.includes(item)) {
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

function validateMessagesFields(data) {
  const suppliedProperties = getObjectProperties(data);

  const validFields = [
    "authorRole",
    "author",
    "message",
    "doctor",
    "patient",
    "messages",
  ];

  let isValid = true;

  suppliedProperties.forEach((property) => {
    if (!validFields.includes(property)) {
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
exports.validateMessagesFields = validateMessagesFields;
