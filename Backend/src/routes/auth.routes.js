'use strict';

const router = require('express').Router();
const { register, login } = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validators');
const validate = require('../middleware/validate');
const { loginLimiter } = require('../middleware/rateLimiter');

router.post('/register', registerValidator, validate, register);
router.post('/login', loginLimiter, loginValidator, validate, login);

module.exports = router;
