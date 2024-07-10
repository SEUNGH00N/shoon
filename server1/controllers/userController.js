const userService = require('../services/userService');

/**
 * 사용자를 로그인합니다.
 * @param {Object} req - Express 요청 객체.
 * @param {Object} res - Express 응답 객체.
 */
const login = async (req, res) => {
  const { id, password } = req.body;

  try {
    const { message, id: userId, isAdmin } = await userService.loginUser(id, password);
    res.status(200).json({ message, id: userId, isAdmin });
  } catch (error) {
    switch (error.message) {
      case 'USER_NOT_FOUND':
        res.status(404).json({ error: '사용자가 존재하지 않습니다.' });
        break;
      case 'USER_PENDING':
        res.status(402).json({ error: '승인 대기 중입니다. 관리자의 승인을 기다려주세요.' });
        break;
      case 'INVALID_PASSWORD':
        res.status(401).json({ error: '비밀번호가 잘못되었습니다.' });
        break;
      default:
        if (error.message.startsWith('USER_REJECTED')) {
          const rejectionReason = error.message.split(':')[1];
          res.status(403).json({ error: '승인이 거절되었습니다.', rejectionReason });
        } else {
          console.error('로그인 오류:', error);
          res.status(500).json({ error: '로그인에 실패했습니다.' });
        }
        break;
    }
  }
};

/**
 * 사용자를 등록합니다.
 * @param {Object} req - Express 요청 객체.
 * @param {Object} res - Express 응답 객체.
 */
const signup = async (req, res) => {
  const { id, password, confirmPassword, email, department, grade, name } = req.body;
  const studentIdImageUrl = req.file ? req.file.filename : null;

  try {
    await userService.signupUser(id, password, confirmPassword, email, department, grade, name, studentIdImageUrl);
    res.status(201).json({ message: '사용자 등록 성공' });
  } catch (error) {
    switch (error.message) {
      case 'PASSWORD_MISMATCH':
        res.status(400).json({ error: '비밀번호와 비밀번호 재입력이 일치하지 않습니다.' });
        break;
      case 'INVALID_PASSWORD':
        res.status(400).json({ error: '비밀번호는 영문, 숫자, 특수문자를 조합하여 10~16자로 입력해주세요.' });
        break;
      default:
        console.error('사용자 등록 오류:', error);
        res.status(500).json({ error: '사용자 등록에 실패했습니다.' });
        break;
    }
  }
};

/**
 * 사용자 ID의 가용성을 확인합니다.
 * @param {Object} req - Express 요청 객체.
 * @param {Object} res - Express 응답 객체.
 */
const checkUser = async (req, res) => {
  const userId = req.query.id; // 클라이언트로부터 요청된 아이디를 가져옵니다.

  try {
    const isAvailable = await userService.checkUserAvailability(userId);
    res.status(200).json({ available: isAvailable });
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    res.status(500).json({ error: '사용자 조회 중 오류가 발생했습니다.' });
  }
};

/**
 * 모든 승인되지 않은 사용자 정보를 가져오는 컨트롤러 메서드
 * @param {*} req HTTP 요청 객체
 * @param {*} res HTTP 응답 객체
 */
const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await userService.getPendingUsers();
    if (pendingUsers.length === 0) {
      res.status(204).send();
    } else {
      res.status(200).json(pendingUsers);
    }
  } catch (error) {
    console.error('사용자 정보를 가져오는 중에 오류가 발생했습니다:', error);
    res.status(500).json({ error: '사용자 정보를 가져오는 중에 오류가 발생했습니다.' });
  }
};

/**
* 사용자의 승인 상태를 업데이트하는 컨트롤러 메서드
* @param {*} req HTTP 요청 객체
* @param {*} res HTTP 응답 객체
*/
const updateApprovalStatus = async (req, res) => {
  const { userId } = req.params;
  const { approvalStatus, rejectionReason } = req.body;

  try {
    await userService.updateApprovalStatus(userId, approvalStatus, rejectionReason);
    res.status(200).json({ message: '사용자 승인 상태가 업데이트되었습니다.' });
  } catch (error) {
    console.error('사용자 승인 상태 업데이트 오류:', error);
    res.status(500).json({ error: '사용자 승인 상태를 업데이트하는 중에 오류가 발생했습니다.' });
  }
};

/**
* 승인 완료된 사용자 정보를 가져오는 컨트롤러 메서드
* @param {*} req HTTP 요청 객체
* @param {*} res HTTP 응답 객체
*/
const getApprovedUsers = async (req, res) => {
  try {
    const approvedUsers = await userService.getApprovedUsers();
    res.status(200).json(approvedUsers);
  } catch (error) {
    console.error('승인된 사용자 정보를 가져오는 중에 오류가 발생했습니다:', error);
    res.status(500).json({ error: '승인된 사용자 정보를 가져오는 중에 오류가 발생했습니다.' });
  }
};



module.exports = {
  login,
  signup,
  checkUser,
  getPendingUsers,
  updateApprovalStatus,
  getApprovedUsers,
};
