const fetch = require('node-fetch');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const visionClient = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_VISION_KEYFILE
});

const ocrService = {
  async performOCR(imageUrl) {
    try {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('이미지를 다운로드하는 데 문제가 발생했습니다.');
      }
      const imageBuffer = await imageResponse.buffer();

      const [result] = await visionClient.textDetection(imageBuffer);
      const detections = result.textAnnotations;

      const numbers = [];
      if (detections.length > 0) {
        const allText = detections[0].description;
        const textLines = allText.split('\n');
        textLines.forEach(line => {
          const lineNumbers = line.match(/\d+/g);
          if (lineNumbers) {
            lineNumbers.forEach(number => numbers.push(number));
          }
        });
      }

      return numbers;
    } catch (error) {
      console.error('OCR 수행 중 오류:', error);
      throw new Error('OCR 수행 중 오류가 발생했습니다.');
    }
  },

  calculateSimilarity(userId, ocrResult) {
    let maxSimilarity = 0;
    ocrResult.forEach(ocrNumber => {
      if (userId.length === ocrNumber.length) {
        let correctDigits = 0;
        for (let j = 0; j < userId.length; j++) {
          if (userId[j] === ocrNumber[j]) {
            correctDigits++;
          }
        }
        const similarity = (correctDigits / userId.length) * 100;
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }
    });

    return maxSimilarity;
  }
};

module.exports = ocrService;