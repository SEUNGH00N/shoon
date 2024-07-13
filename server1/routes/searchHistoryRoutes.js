const express = require('express');
const searchHistoryController = require('../controllers/searchHistoryController');
const router = express.Router();

router.post('/', searchHistoryController.saveSearchTerm);
router.get('/', searchHistoryController.getLatestSearchTerm);
router.get('/:userId', searchHistoryController.getSearchKeywordsByUserId);
router.delete('/delete/:id', searchHistoryController.deleteSearchKeywordById);

module.exports = router;
