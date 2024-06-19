import React, { useState } from 'react';
import '../../styles/login.css';
import logo from '../../image/logo.png';
import serverHost from '../../utils/host';

function FindId() {
  const [formData, setFormData] = useState({
    email: '',
    department: '',
    grade: ''
  });
  const [id, setId] = useState('');
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);
  const [showFoundModal, setShowFoundModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  // 아이디 찾기 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${serverHost}:8800/find-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setId(data.id);
        setShowFoundModal(true);
      } else {
        setShowNotFoundModal(true);
      }
    } catch (error) {
      console.error('아이디 찾기 오류:', error);
    }
  };

  const handleCloseNotFoundModal = () => {
    setShowNotFoundModal(false);
  };

  const navigateToLogin = () => {
    window.location.href = '/Login';
  };
  const navigateToFindPw = () => {
    window.location.href = '/FindPw';
  };

  return (
    <div><img src={logo} id='logo' alt="로고" />
      <h1 className="findid-header">아이디 찾기</h1>
      <div className="findid-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일을 입력하세요"
              required
            />
          </div>

          {/* 학과/학년 선택 셀렉트 */}
          <div className="select-group">
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              style={{ color: formData.department ? 'black' : 'gray' }}
              required
            >
              <option value="">학과를 선택하세요</option>
              <option value="computer_science">컴퓨터 공학과</option>
              <option value="software_engineering">소프트웨어 공학과</option>
              <option value="design">디자인학과</option>
              <option value="business-administration">경영학과</option>
            </select>

            <select
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              style={{ color: formData.grade ? 'black' : 'gray' }}
              required
            >
              <option value="">학년을 선택하세요</option>
              <option value="1">1학년</option>
              <option value="2">2학년</option>
              <option value="3">3학년</option>
              <option value="4">4학년</option>
            </select>
          </div>
          <button type="submit" className="findid-button">아이디 찾기</button>
        </form>

        {showNotFoundModal && (
          <div className="modal">
            <div className="modal-content">
              <p className="not-found">아이디를 찾을 수 없습니다.</p>
              <button className="modal-close" onClick={handleCloseNotFoundModal}>확인</button>
            </div>
          </div>
        )}

        {showFoundModal && (
          <div className="modal">
            <div className="modal-content">
              <p className="found-id">찾은 아이디: {id}</p>
              <div className="findid-modal">
                <button className="findid-login" onClick={navigateToLogin}>로그인 하기</button>
                <button className="findid-fwfind" onClick={navigateToFindPw}>비밀번호 찾기</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FindId;