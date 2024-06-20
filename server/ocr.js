require('dotenv').config(); // 환경 변수 로드
const fetch = require('node-fetch');
const { ImageAnnotatorClient } = require('@google-cloud/vision');

// Google Cloud Vision 클라이언트 생성
const visionClient = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_VISION_KEYFILE // 환경 변수 사용
});

// OCR 수행 및 숫자 추출 함수
async function performOCR(imageUrl) {
  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('이미지를 다운로드하는 데 문제가 발생했습니다.');
    }
    const imageBuffer = await imageResponse.buffer();

    // Cloud Vision API를 사용하여 OCR 수행
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
}

// 유사도 계산 함수
function calculateSimilarity(userId, ocrResult) {
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

module.exports = { performOCR, calculateSimilarity };
