const { getObjectProperties } = require("../utils/getObjectProperties");

function validateDoctorFields(data) {
  const suppliedProperties = getObjectProperties(data);

  const validFields = [
    "doctorAccount",
    "qualification",
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
    "profilePicture",
    "certificate",
    "currentStatus",
    "verified",
  ];

  let isValid = true;

  suppliedProperties.forEach((item) => {
    if (!validFields.includes(item)) {
      isValid = false;
    }
  });

  return isValid;
}

exports.validateDoctorFields = validateDoctorFields;
