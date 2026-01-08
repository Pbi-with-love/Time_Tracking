export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;

  // isOperation is used to check if error caused by user or business logic
  res.status(status).json({
    message: err.isOperational
      ? err.message
      : "Internal server error",
  });
};
