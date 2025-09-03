const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'بيانات غير صحيحة',
      errors: errors.array()
    });
  }
  next();
};

const validateTransaction = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('المبلغ يجب أن يكون أكبر من صفر'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('الوصف يجب أن يكون أقل من 500 حرف'),
  body('reference_number')
    .optional()
    .isLength({ max: 50 })
    .withMessage('رقم المرجع يجب أن يكون أقل من 50 حرف'),
  handleValidationErrors
];

const validateTransfer = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('المبلغ يجب أن يكون أكبر من صفر'),
  body('to_treasury_id')
    .isInt({ min: 1 })
    .withMessage('معرف الخزينة الهدف مطلوب'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('الوصف يجب أن يكون أقل من 500 حرف'),
  handleValidationErrors
];

const validateTreasury = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('اسم الخزينة يجب أن يكون بين 2 و 100 حرف'),
  body('type')
    .isIn(['main', 'sub'])
    .withMessage('نوع الخزينة يجب أن يكون main أو sub'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('الوصف يجب أن يكون أقل من 500 حرف'),
  handleValidationErrors
];

const validateUser = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('اسم المستخدم يجب أن يكون بين 3 و 50 حرف'),
  body('email')
    .isEmail()
    .withMessage('البريد الإلكتروني غير صحيح'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateTransaction,
  validateTransfer,
  validateTreasury,
  validateUser
};