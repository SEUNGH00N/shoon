const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.get('/:productId', messageController.getMessages);

module.exports = router;
