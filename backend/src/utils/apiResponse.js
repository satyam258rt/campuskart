class ApiResponse {
  static success(res, data = {}, message = 'Operation successful', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data
    });
  }

  static created(res, data = {}, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  static paginated(res, { data, total, page, limit, message = 'Data retrieved successfully' }) {
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message,
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  }
}

module.exports = ApiResponse;
