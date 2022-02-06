function validateDoctorFields(data) {
  const { doctorAccount, qualification, address, availability, verified } =
    data;

  const bodyFields = Object.getOwnPropertyNames(data);

  const validFields = [
    "doctorAccount",
    "qualification",
    "address",
    "city",
    "town",
    "neighbourhood",
    "street",
    "availability",
    "from",
    "till",
    "verified",
  ];

  let isValid = true;

  bodyFields.forEach((item) => {
    if (!validFields.includes(item)) {
      isValid = false;
    }

    if (item === "address") {
      const addressFields = Object.getOwnPropertyNames(address);
      addressFields.forEach((item) => {
        if (!validFields.includes(item)) {
          isValid = false;
        }
      });
    }

    if (item === "availability") {
      availability.forEach((elem) => {
        const timeFields = Object.getOwnPropertyNames(elem);
        timeFields.forEach((field) => {
          if (!validFields.includes(field)) {
            isValid = false;
          }
        });
      });
    }
  });

  return isValid;
}

exports.validateDoctorFields = validateDoctorFields;
