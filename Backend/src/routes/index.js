'use strict';

const router = require('express').Router();
const authRoutes = require('./auth.routes');
const enquiryRoutes = require('./enquiry.routes');

router.use('/auth', authRoutes);
router.use('/enquiries', enquiryRoutes);

module.exports = router;
