// backend/src/middleware/validateRequest.middleware.js
const validateRequest = (schema) => {
  return (req, res, next) => {
    console.log('=== Validation Middleware ===');
    console.log('Request body before validation:', JSON.stringify(req.body, null, 2));
    
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      console.error('Validation errors:', error.details);
      const errors = {};
      error.details.forEach((detail) => {
        errors[detail.path[0]] = detail.message;
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    console.log('Validated value (after):', JSON.stringify(value, null, 2));
    
    // Replace req.body with validated data
    req.body = value;
    next();
  };
};

module.exports = { validateRequest };
