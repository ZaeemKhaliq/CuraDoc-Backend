class ErrorHandler {
  onCatchResponse(params) {
    if (!params.res || !params.error) return;

    const { res, error, message } = params;

    return res.status(500).send({
      message: message || "Some error occurred while processing request.",
      error: error.message,
    });
  }
}

module.exports = new ErrorHandler();
