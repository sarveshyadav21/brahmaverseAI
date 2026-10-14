'use strict';

const router = require('express').Router();
const { submit, getPublic, getMy, claim } = require('../controllers/enquiry.controller');
const { submitEnquiryValidator, enquiryIdValidator } = require('../validators/enquiry.validators');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { enquiryLimiter } = require('../middleware/rateLimiter');

// ── Public (no auth) ──────────────────────────────────────────────────────────
router.post('/', enquiryLimiter, submitEnquiryValidator, validate, submit);

// ── Protected (auth required) ─────────────────────────────────────────────────
// IMPORTANT: /public and /my must be declared BEFORE /:id to avoid being
// swallowed by the param route.
router.get('/public', auth, getPublic);
router.get('/my', auth, getMy);
router.patch('/:id/claim', auth, enquiryIdValidator, validate, claim);

module.exports = router;
