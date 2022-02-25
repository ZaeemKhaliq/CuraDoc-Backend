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

exports.validateDoctorFields = validateDoctorFields;
