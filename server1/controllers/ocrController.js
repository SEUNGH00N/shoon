const ocrService = require('../services/ocrService');

const ocrController = {
  verify: async (req, res) => {
    try {
      const { imageUrl, userId } = req.body;
      const ocrResult = await ocrService.performOCR(imageUrl);
      const similarity = ocrService.calculateSimilarity(userId, ocrResult);
      res.status(200).json({ ocrResult, similarity });
    } catch (error) {
      console.error('OCR 및 유사도 검증 오류:', error);
      res.status(500).json({ error: 'OCR 및 유사도 검증 중에 오류가 발생했습니다.' });
    }
  }
};

module.exports = ocrController;
