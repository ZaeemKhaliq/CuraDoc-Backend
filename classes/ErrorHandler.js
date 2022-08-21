class ErrorHandler {
  onCatchResponse(params) {
    const { res, error, message } = params;

    if (!res || !error) return;

    return res.status(500).send({
      message: message || "Some error occurred while processing request.",
      error,
      errorMessage: error.message,
    });
  }
}

module.exports = new ErrorHandler();
