const userService = require('../services/userService');

/**
 * 사용자 등록 컨트롤러
 * @param {object} req - 요청 객체
 * @param {object} res - 응답 객체
 */
const signup = async (req, res) => {
  const { id, password, confirmPassword, email, department, grade, name } = req.body;
  const studentIdImageUrl = req.file.path;

  try {
    await userService.signupUser(id, password, confirmPassword, email, department, grade, name, studentIdImageUrl);
    res.status(201).json({ message: '사용자가 성공적으로 등록되었습니다.' });
  } catch (error) {
    console.error('회원 가입 중 오류 발생:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 사용자 로그인 컨트롤러
 * @param {object} req - 요청 객체
 * @param {object} res - 응답 객체
 */
const login = async (req, res) => {
  const { id, password } = req.body;

  try {
    const userInfo = await userService.loginUser(id, password);
    res.status(200).json(userInfo);
  } catch (error) {
    console.error('로그인 중 오류 발생:', error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * 사용자 ID 중복 확인 컨트롤러
 * @param {object} req - 요청 객체
 * @param {object} res - 응답 객체
 */
const checkUser = async (req, res) => {
  const { id } = req.query;

  try {
    const isAvailable = await userService.checkUserAvailability(id);
    res.status(200).json({ isAvailable });
  } catch (error) {
    console.error('사용자 ID 중복 확인 중 오류 발생:', error);
    res.status(500).json({ message: '서버 내부 오류' });
  }
};

/**
 * 모든 승인되지 않은 사용자 정보 가져오기 컨트롤러
 * @param {object} req - 요청 객체
 * @param {object} res - 응답 객체
 */
const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await userService.getPendingUsers();
    res.status(200).json(pendingUsers);
  } catch (error) {
    console.error('승인 대기 중인 사용자 정보 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 내부 오류' });
  }
};

/**
 * 사용자의 승인 상태 업데이트 컨트롤러
 * @param {object} req - 요청 객체
 * @param {object} res - 응답 객체
 */
const updateApprovalStatus = async (req, res) => {
  const { userId } = req.params;
  const { approvalStatus, rejectionReason } = req.body;

  try {
    await userService.updateApprovalStatus(userId, approvalStatus, rejectionReason);
    res.status(200).json({ message: '사용자 승인 상태가 성공적으로 업데이트되었습니다.' });
  } catch (error) {
    console.error('사용자 승인 상태 업데이트 중 오류 발생:', error);
    res.status(500).json({ message: '서버 내부 오류' });
  }
};

/**
 * 승인된 사용자 정보 가져오기 컨트롤러
 * @param {object} req - 요청 객체
 * @param {object} res - 응답 객체
 */
const getApprovedUsers = async (req, res) => {
  try {
    const approvedUsers = await userService.getApprovedUsers();
    res.status(200).json(approvedUsers);
  } catch (error) {
    console.error('승인된 사용자 정보 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 내부 오류' });
  }
};

/**
 * 사용자 유형 정보 가져오기 컨트롤러
 * @param {object} req - 요청 객체
 * @param {object} res - 응답 객체
 */
const getUserType = async (req, res) => {
  const { userId } = req.query;

  try {
    const userType = await userService.getUserTypeById(userId);
    res.status(200).json({ userType });
  } catch (error) {
    console.error('사용자 유형 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 내부 오류' });
  }
};

/**
 * 내 정보 조회 컨트롤러
 * @param {object} req - 요청 객체
 * @param {object} res - 응답 객체
 */
const getMyInfo = async (req, res) => {
  const { userId, password } = req.body;

  try {
    const userInfo = await userService.getUserInfo(userId, password);
    res.status(200).json(userInfo);
  } catch (error) {
    console.error('내 정보 조회 중 오류 발생:', error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * 비밀번호 변경 컨트롤러
 * @param {object} req - 요청 객체
 * @param {object} res - 응답 객체
 */
const changePassword = async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  try {
    await userService.changePassword(userId, currentPassword, newPassword);
    res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (error) {
    console.error('비밀번호 변경 중 오류 발생:', error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * 사용자 정보 수정 컨트롤러
 * @param {object} req - 요청 객체
 * @param {object} res - 응답 객체
 */
const editUserInfo = async (req, res) => {
  const { userId, editedUserInfo } = req.body;

  try {
    await userService.editUserInfo(userId, editedUserInfo);
    res.status(200).json({ message: '사용자 정보가 성공적으로 수정되었습니다.' });
  } catch (error) {
    console.error('사용자 정보 수정 중 오류 발생:', error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * 세션에 저장된 사용자 ID를 기반으로 사용자 정보를 반환하는 엔드포인트
 */
const getUserInfo = async (req, res) => {
  try {
    // 세션에서 사용자 ID 가져오기
    const userId = req.headers.user_id; // 사용자 ID는 요청 헤더에서 가져옵니다.

    // 사용자 ID가 없으면 권한 없음(401) 응답 보내기
    if (!userId) {
      return res.status(401).send('Unauthorized');
    }

    // 서비스에서 사용자 정보 가져오기
    const userInfoWithSalesAndBalance = await userService.getUserInfoWithSalesAndBalance(userId);

    // 사용자 정보 반환
    res.json(userInfoWithSalesAndBalance);
  } catch (error) {
    console.error('사용자 정보 조회 중 오류 발생:', error);
    res.status(500).json({ error: '사용자 정보 조회 중 오류 발생' });
  }
};

module.exports = {
  signup,
  login,
  checkUser,
  getPendingUsers,
  updateApprovalStatus,
  getApprovedUsers,
  getUserType,
  getMyInfo,
  changePassword,
  editUserInfo,
  getUserInfo,
};
