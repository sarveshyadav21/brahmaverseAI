'use strict';

const { body, param } = require('express-validator');

const submitEnquiryValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must be at most 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),

  body('courseInterest')
    .trim()
    .notEmpty().withMessage('Course interest is required')
    .isLength({ max: 150 }).withMessage('Course interest must be at most 150 characters'),

  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^[+\d][\d\s\-]{5,14}$/).withMessage('Invalid phone number (7–15 digits, may include +, spaces, dashes)'),

  body('message')
    .optional({ checkFalsy: true })
    .isLength({ max: 1000 }).withMessage('Message must be at most 1000 characters'),
];

const enquiryIdValidator = [
  // :id must be a positive integer — 422 otherwise
  param('id')
    .isInt({ min: 1, max: 2147483647 }).withMessage('Enquiry ID must be a positive integer')
    .toInt(),
];

module.exports = { submitEnquiryValidator, enquiryIdValidator };
