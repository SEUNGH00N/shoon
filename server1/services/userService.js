const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

const userService = {
  /**
   * 비밀번호 유효성을 검사합니다.
   * @param {string} password - 비밀번호.
   * @param {string} confirmPassword - 확인 비밀번호.
   * @throws {Error} 비밀번호가 일치하지 않거나 유효하지 않은 경우.
   */
  validatePassword: (password, confirmPassword) => {
    if (password !== confirmPassword) {
      throw new Error('PASSWORD_MISMATCH');  // 비밀번호가 일치하지 않음
    }
    const isValidPassword = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{10,16}$/.test(password);
    if (!isValidPassword) {
      throw new Error('INVALID_PASSWORD');  // 비밀번호 형식이 올바르지 않음
    }
  },

  /**
   * 사용자를 등록합니다.
   * @param {string} id - 사용자 ID.
   * @param {string} password - 비밀번호.
   * @param {string} confirmPassword - 확인 비밀번호.
   * @param {string} email - 이메일.
   * @param {string} department - 학과.
   * @param {string} grade - 학년.
   * @param {string} name - 이름.
   * @param {string} studentIdImageUrl - 학생증 이미지 URL.
   * @returns {Promise<void>}
   */
  signupUser: async (id, password, confirmPassword, email, department, grade, name, studentIdImageUrl) => {
    userService.validatePassword(password, confirmPassword);  // 비밀번호 유효성 검사
    const hashedPassword = await bcrypt.hash(password, 10);  // 비밀번호 해싱
    await userModel.addUser(id, hashedPassword, email, department, grade, name, studentIdImageUrl);  // 사용자 등록
  },

  /**
   * 사용자를 로그인합니다.
   * @param {string} id - 사용자 ID.
   * @param {string} password - 비밀번호.
   * @returns {Promise<object>} 로그인 메시지 및 사용자 정보.
   * @throws {Error} 사용자가 존재하지 않거나 비밀번호가 일치하지 않거나 승인이 거절된 경우.
   */
  loginUser: async (id, password) => {
    const user = await userModel.getUserById(id);  // 사용자 조회

    if (!user) {
      throw userService.createError('USER_NOT_FOUND', 404);  // 사용자가 없음
    }

    if (user.admin === 'pending') {
      throw userService.createError('USER_PENDING', 402);  // 승인 대기 중인 사용자
    }

    const passwordMatch = await bcrypt.compare(password, user.password);  // 비밀번호 일치 확인

    if (!passwordMatch) {
      throw userService.createError('INVALID_PASSWORD', 401);  // 비밀번호 불일치
    }

    if (user.admin === 'rejected') {
      const rejectionReason = user.rejection_reason || '관리자에게 문의하세요.';
      const error = userService.createError(`USER_REJECTED:${rejectionReason}`, 403);
      error.rejectionReason = rejectionReason;
      throw error;  // 승인 거부된 사용자
    }

    const isAdmin = user.admin === 'admin';
    const message = isAdmin ? '관리자로 로그인 되었습니다.' : '로그인 성공';  // 로그인 성공 메시지

    return { message, id: user.id, isAdmin };
  },

  /**
   * 사용자 ID의 가용성을 확인합니다.
   * @param {string} id - 사용자 ID.
   * @returns {Promise<boolean>} 사용자 ID가 가용한지 여부.
   */
  checkUserAvailability: async (id) => {
    const users = await userModel.findUserById(id);
    return users.length === 0;  // 사용자 ID가 가용한지 여부 반환
  },

  /**
   * 모든 승인되지 않은 사용자 정보를 가져옵니다.
   * @returns {Promise<Array>} 승인되지 않은 사용자 정보 배열.
   */
  getPendingUsers: async () => {
    return await userModel.getPendingUsers();
  },

  /**
   * 사용자의 승인 상태를 업데이트합니다.
   * @param {string} userId - 사용자 ID.
   * @param {string} approvalStatus - 승인 상태 ('approved' 또는 'rejected').
   * @param {string} rejectionReason - 거절 사유 (옵션).
   * @returns {Promise<void>}
   */
  updateApprovalStatus: async (userId, approvalStatus, rejectionReason = null) => {
    await userModel.updateApprovalStatus(userId, approvalStatus, rejectionReason);
  },

  /**
   * 승인된 사용자 정보를 가져옵니다.
   * @returns {Promise<Array>} 승인된 사용자 정보 배열.
   */
  getApprovedUsers: async () => {
    return await userModel.getApprovedUsers();
  },

  /**
   * 사용자 유형을 ID로 가져옵니다.
   * @param {string} userId - 사용자 ID.
   * @returns {Promise<string>} 사용자 유형.
   */
  getUserTypeById: async (userId) => {
    return await userModel.getUserTypeById(userId);
  },

  /**
   * 주어진 ID와 비밀번호로 사용자 정보를 가져옵니다.
   * @param {string} userId - 사용자 ID.
   * @param {string} password - 사용자 비밀번호.
   * @returns {Promise<object>} 사용자 정보 객체.
   * @throws {Error} 사용자가 존재하지 않거나 비밀번호가 일치하지 않을 경우.
   */
  getUserInfo: async (userId, password) => {
    const user = await userModel.getUserById(userId);  // 사용자 조회

    if (!user) {
      const error = new Error('USER_NOT_FOUND');
      error.statusCode = 404;
      throw error;  // 사용자가 없음
    }

    const passwordMatch = await bcrypt.compare(password, user.password);  // 비밀번호 일치 확인
    if (!passwordMatch) {
      const error = new Error('INVALID_PASSWORD');
      error.statusCode = 401;
      throw error;  // 비밀번호 불일치
    }

    return {
      id: user.id,
      name: user.name,
      grade: user.grade,
      department: user.department,
      email: user.email
    };
  },

  /**
   * 비밀번호를 변경합니다.
   * @param {string} userId - 사용자 ID.
   * @param {string} currentPassword - 현재 비밀번호.
   * @param {string} newPassword - 새로운 비밀번호.
   * @returns {Promise<void>}
   * @throws {Error} 현재 비밀번호가 일치하지 않거나 새로운 비밀번호가 유효하지 않을 경우.
   */
  changePassword: async (userId, currentPassword, newPassword) => {
    const user = await userModel.getUserById(userId);  // 사용자 조회

    if (!user) {
      const error = new Error('사용자를 찾을 수 없습니다.');
      error.statusCode = 404;
      throw error;  // 사용자가 없음
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);  // 현재 비밀번호 일치 확인
    if (!passwordMatch) {
      const error = new Error('현재 비밀번호가 일치하지 않습니다.');
      error.statusCode = 401;
      throw error;  // 현재 비밀번호 불일치
    }

    const isValidPassword = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{10,16}$/.test(newPassword);
    if (!isValidPassword) {
      const error = new Error('올바른 형식의 비밀번호를 입력해주세요.');
      error.statusCode = 400;
      throw error;  // 유효하지 않은 새 비밀번호 형식
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);  // 새 비밀번호 해싱
    await userModel.updatePassword(userId, hashedPassword);  // 비밀번호 업데이트
  },

  /**
   * 사용자 정보를 수정합니다.
   * @param {string} userId - 사용자 ID.
   * @param {object} editedUserInfo - 수정할 사용자 정보 객체.
   * @returns {Promise<void>}
   * @throws {Error} 사용자가 존재하지 않을 경우.
   */
  editUserInfo: async (userId, editedUserInfo) => {
    const user = await userModel.getUserById(userId);  // 사용자 조회

    if (!user) {
      const error = new Error('사용자를 찾을 수 없습니다.');
      error.statusCode = 404;
      throw error;  // 사용자가 없음
    }

    const updatedUserInfo = { ...user, ...editedUserInfo };
    await userModel.updateUserInfo(userId, updatedUserInfo);  // 사용자 정보 업데이트
  },

  /**
   * 사용자 ID를 기반으로 판매 내역과 잔액을 포함한 사용자 정보를 가져옵니다.
   * @param {string} userId - 사용자 ID.
   * @returns {Promise<object>} 사용자 정보 객체.
   */
  getUserInfoWithSalesAndBalance: async (userId) => {
    // 사용자 정보 조회
    let userInfo = await userModel.getById(userId);

    // 학과명을 한글로 변환하기 위한 매핑 객체
    const departmentMap = {
      'software_engineering': '소프트웨어학과',
      'computer_science': '컴퓨터공학과',
      'design': '디자인학과',
      'business_administration': '경영학과'
      // 필요에 따라 추가적인 학과를 매핑할 수 있습니다.
    };

    // 매핑된 학과명으로 변경
    userInfo.department = departmentMap[userInfo.department] || userInfo.department;

    // 사용자의 총 판매액과 판매한 상품의 총 가격을 가져와서 잔액을 계산
    const totalSales = await userModel.getTotalSales(userId);
    const totalPriceOfSoldProducts = await userModel.getTotalPriceOfSoldProducts(userId);
    const balance = totalSales - totalPriceOfSoldProducts;

    // 사용자 정보에 총 판매액과 잔액 정보를 추가하여 반환
    return {
      ...userInfo,
      total_sales: totalSales,
      balance: balance
    };
  },

  /**
   * 오류 객체를 생성합니다.
   * @param {string} message - 오류 메시지.
   * @param {number} statusCode - HTTP 상태 코드.
   * @returns {Error} 생성된 오류 객체.
   */
  createError: (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  },

  getSellerInfo: async (productId) => {
    try {
      const productRows = await userModel.getProductWithSellerInfo(productId);

      if (productRows.length === 0) {
        return null;
      }

      return {
        sellerId: productRows[0].user_id,
        sellerName: productRows[0].name,
        rates: productRows[0].rates
      };
    } catch (error) {
      throw new Error('상품 정보 조회 오류');
    }
  },
};

module.exports = userService;
