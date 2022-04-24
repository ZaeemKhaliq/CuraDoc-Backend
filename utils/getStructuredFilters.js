function getStructuredFilters(filters) {
  const structuredFilters = {
    basic: {},
    clinic: {},
  };
  if (filters.hasOwnProperty("verified")) {
    structuredFilters.basic.verified = filters.verified;
  }
  if (filters.hasOwnProperty("experience")) {
    structuredFilters.basic["professionalDetails.domainExperience"] =
      filters.experience;
  }
  if (filters.hasOwnProperty("qualification")) {
    structuredFilters.basic["professionalDetails.qualification"] =
      filters.qualification;
  }
  if (filters.hasOwnProperty("town")) {
    structuredFilters.clinic["clinics.location.town"] = filters.town;
  }
  if (filters.hasOwnProperty("neighbourhood")) {
    structuredFilters.clinic["clinics.location.neighbourhood"] =
      filters.neighbourhood;
  }

  return structuredFilters;
}

module.exports = getStructuredFilters;
