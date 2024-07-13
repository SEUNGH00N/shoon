const pool = require('../config/db');

const searchHistoryModel = {
    saveSearchTerm: async (searchTerm, userId) => {
        const [result] = await pool.execute('INSERT INTO search_history (search_term, user_id) VALUES (?, ?)', [searchTerm, userId]);
        return result;
    },

    getLatestSearchTerm: async () => {
        const [result] = await pool.execute('SELECT * FROM search_history ORDER BY search_date DESC LIMIT 1');
        return result[0];
    },

    getSearchKeywordsByUserId: async (userId) => {
        const [result] = await pool.query('SELECT * FROM search_history WHERE user_id = ? ORDER BY search_date DESC', [userId]);
        return result;
    },

    deleteSearchKeywordById: async (id) => {
        const [result] = await pool.query('DELETE FROM search_history WHERE id = ?', [id]);
        return result;
    }
};

module.exports = searchHistoryModel;
