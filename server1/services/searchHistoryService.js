const searchHistoryModel = require('../models/searchHistoryModel');

const searchHistoryService = {
    saveSearchTerm: async (searchTerm, userId) => {
        if (searchTerm !== undefined && userId !== undefined) {
            return await searchHistoryModel.saveSearchTerm(searchTerm, userId);
        } else {
            throw new Error('Invalid search term or user ID');
        }
    },

    getLatestSearchTerm: async () => {
        return await searchHistoryModel.getLatestSearchTerm();
    },

    getSearchKeywordsByUserId: async (userId) => {
        return await searchHistoryModel.getSearchKeywordsByUserId(userId);
    },

    deleteSearchKeywordById: async (id) => {
        return await searchHistoryModel.deleteSearchKeywordById(id);
    }
};

module.exports = searchHistoryService;
