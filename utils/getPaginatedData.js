async function getPaginatedData(model, page, limit, filters = {}) {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = {};

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit,
    };
  }

  if (endIndex < (await model.countDocuments().exec())) {
    results.next = {
      page: page + 1,
      limit,
    };
  }

  try {
    let aggrForClinics = [];
    if (
      filters.clinic.hasOwnProperty("clinics.location.town") ||
      filters.clinic.hasOwnProperty("clinics.location.neighbourhood")
    ) {
      aggrForClinics = [
        {
          $unwind: "$clinics",
        },
        { $match: filters.clinic },
      ];
    }

    let aggrQuery = [
      {
        $match: {
          ...filters.basic,
        },
      },
      ...aggrForClinics,
      {
        $skip: startIndex,
      },
      {
        $limit: limit,
      },
    ];

    let countQuery = [
      {
        $match: {
          ...filters.basic,
        },
      },
      ...aggrForClinics,
      {
        $group: {
          _id: null,
          count: {
            $sum: 1,
          },
        },
      },
    ];

    const pipeline = [
      {
        $facet: {
          doctors: aggrQuery,
          count: countQuery,
        },
      },
    ];

    results.result = await model.aggregate(pipeline);

    // results.result = await model.find(filters).limit(limit).skip(startIndex);

    return results;
  } catch (error) {
    return {
      message: "Some error occurred while processing request!",
      error: error.message,
    };
  }
}

module.exports = getPaginatedData;
