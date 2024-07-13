const searchHistoryService = require('../services/searchHistoryService');

const searchHistoryController = {
    saveSearchTerm: async (req, res) => {
        const { searchTerm, userId } = req.body;
        try {
            await searchHistoryService.saveSearchTerm(searchTerm, userId);
            res.sendStatus(200);
        } catch (error) {
            console.error('Error saving search term:', error);
            res.status(500).json({ error: 'Failed to save search term' });
        }
    },

    getLatestSearchTerm: async (req, res) => {
        try {
            const latestSearchTerm = await searchHistoryService.getLatestSearchTerm();
            res.json(latestSearchTerm);
        } catch (error) {
            console.error('Error fetching latest search term:', error);
            res.status(500).json({ error: 'Failed to fetch latest search term' });
        }
    },

    getSearchKeywordsByUserId: async (req, res) => {
        const userId = req.params.userId;
        try {
            const searchKeywords = await searchHistoryService.getSearchKeywordsByUserId(userId);
            res.json(searchKeywords);
        } catch (error) {
            console.error('Error fetching search keywords:', error);
            res.status(500).json({ error: 'Failed to fetch search keywords' });
        }
    },

    deleteSearchKeywordById: async (req, res) => {
        const keywordId = req.params.id;
        try {
            await searchHistoryService.deleteSearchKeywordById(keywordId);
            res.sendStatus(200);
        } catch (error) {
            console.error('Error deleting search keyword:', error);
            res.status(500).json({ error: 'Failed to delete search keyword' });
        }
    }
};

module.exports = searchHistoryController;
