'use strict';

const asyncHandler = require('../utils/asyncHandler');
const enquiryService = require('../services/enquiry.service');

const submit = asyncHandler(async (req, res) => {
  const enquiry = await enquiryService.submitEnquiry(req.body);
  res.status(201).json({ success: true, data: enquiry });
});

const getPublic = asyncHandler(async (req, res) => {
  const result = await enquiryService.getPublicEnquiries(req.query);
  res.status(200).json({ success: true, ...result });
});

const getMy = asyncHandler(async (req, res) => {
  const result = await enquiryService.getMyEnquiries(req.employee.id, req.query);
  res.status(200).json({ success: true, ...result });
});

const claim = asyncHandler(async (req, res) => {
  const enquiry = await enquiryService.claimEnquiry(
    parseInt(req.params.id, 10),
    req.employee.id,
  );
  res.status(200).json({ success: true, data: enquiry });
});

module.exports = { submit, getPublic, getMy, claim };
