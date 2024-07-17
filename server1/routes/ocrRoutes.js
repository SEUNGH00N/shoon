const express = require('express');
const router = express.Router();
const { verify } = require('../controllers/ocrController');

router.post('/verify', verify);

module.exports = router;
