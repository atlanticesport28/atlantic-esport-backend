const success = (res, data, message = 'Success', status = 200) => {
  res.status(status).json({
    success: true,
    message,
    data
  });
};

const error = (res, message = 'Error', status = 500) => {
  res.status(status).json({
    success: false,
    error: {
      message,
      status
    }
  });
};

module.exports = { success, error };
