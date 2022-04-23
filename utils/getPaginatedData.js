async function getPaginatedData(model, page, limit) {
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
    results.result = await model.find().limit(limit).skip(startIndex);

    return results;
  } catch (error) {
    return {
      message: "Some error occurred while processing request!",
      error: error.message,
    };
  }
}

module.exports = getPaginatedData;
