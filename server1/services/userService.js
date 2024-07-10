const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

/**
 * 비밀번호를 검증합니다.
 * @param {string} password - 비밀번호.
 * @param {string} confirmPassword - 확인 비밀번호.
 * @throws {Error} 비밀번호가 일치하지 않거나 유효하지 않은 경우.
 */
const validatePassword = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    throw new Error('PASSWORD_MISMATCH');
  }
  const isValidPassword = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{10,16}$/.test(password);
  if (!isValidPassword) {
    throw new Error('INVALID_PASSWORD');
  }
};

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
const signupUser = async (id, password, confirmPassword, email, department, grade, name, studentIdImageUrl) => {
  validatePassword(password, confirmPassword);

  const hashedPassword = await bcrypt.hash(password, 10);
  await userModel.addUser(id, hashedPassword, email, department, grade, name, studentIdImageUrl);
};

/**
 * 사용자를 로그인합니다.
 * @param {string} id - 사용자 ID.
 * @param {string} password - 비밀번호.
 * @returns {Promise<object>} 로그인 메시지 및 사용자 정보.
 * @throws {Error} 사용자가 존재하지 않거나 비밀번호가 일치하지 않거나 승인이 거절된 경우.
 */
const loginUser = async (id, password) => {
  const user = await userModel.getUserById(id);

  if (!user) {
    const error = new Error('USER_NOT_FOUND');
    error.statusCode = 404;
    throw error;
  }

  if (user.admin === 'pending') {
    const error = new Error('USER_PENDING');
    error.statusCode = 402;
    throw error;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    const error = new Error('INVALID_PASSWORD');
    error.statusCode = 401;
    throw error;
  }

  if (user.admin === 'rejected') {
    const rejectionReason = user.rejection_reason || '관리자에게 문의하세요.';
    const error = new Error(`USER_REJECTED:${rejectionReason}`);
    error.statusCode = 403;
    error.rejectionReason = rejectionReason;
    throw error;
  }

  const isAdmin = user.admin === 'admin';
  const message = isAdmin ? '관리자로 로그인 되었습니다.' : '로그인 성공';

  return { message, id: user.id, isAdmin };
};


/**
 * 사용자 ID의 가용성을 확인합니다.
 * @param {string} id - 사용자 ID.
 * @returns {Promise<boolean>} 사용자 ID가 가용한지 여부.
 */
const checkUserAvailability = async (id) => {
  const users = await userModel.findUserById(id);
  return users.length === 0; // 사용자가 존재하지 않으면 true 반환
};

/**
 * 모든 승인되지 않은 사용자 정보를 가져옵니다.
 * @returns {Promise<Array>} 승인되지 않은 사용자 정보 배열.
 */
const getPendingUsers = async () => {
  return await userModel.getPendingUsers();
};

/**
 * 사용자의 승인 상태를 업데이트합니다.
 * @param {string} userId - 사용자 ID.
 * @param {string} approvalStatus - 승인 상태 ('approved' 또는 'rejected').
 * @param {string} rejectionReason - 거절 사유 (옵션).
 * @returns {Promise<void>}
 */
const updateApprovalStatus = async (userId, approvalStatus, rejectionReason = null) => {
  await userModel.updateApprovalStatus(userId, approvalStatus, rejectionReason);
};

/**
 * 승인된 사용자 정보를 가져옵니다.
 * @returns {Promise<Array>} 승인된 사용자 정보 배열.
 */
const getApprovedUsers = async () => {
  return await userModel.getApprovedUsers();
};

module.exports = {
  loginUser,
  signupUser,
  checkUserAvailability,
  getApprovedUsers,
  getPendingUsers,
  updateApprovalStatus,
};
