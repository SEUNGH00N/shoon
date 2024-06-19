import React, { useState } from 'react';
import '../../styles/login.css';
import logo from '../../image/logo.png';
import serverHost from '../../utils/host';
function FindPw() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleResetPassword = async () => {
    try {
      const response = await fetch(`${serverHost}:8800/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
      } else {
        setMessage('가입하지 않은 이메일입니다.');
      }
    } catch (error) {
      console.error('비밀번호 찾기 오류:', error);
      setMessage('서버 오류로 인해 비밀번호를 찾을 수 없습니다.');
    } finally {
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const navigateToLogin = () => {
    window.location.href = '/Login';
  };

  return (

    <div><img src={logo} id='logo' alt="로고" />
      <h1 className="findpw-header">비밀번호 찾기</h1>
      <div className="findpw-container">
        <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }}>
          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="이메일을 입력하세요"
              required
            />
          </div>
          <button type="submit" className="findpw-button">비밀번호 찾기</button>
        </form>

        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <p className="found-pw">{message}</p>
              <div className="pwfind-modal">
                {message === '가입하지 않은 이메일입니다.' ? (
                  <button className="modal-close" onClick={closeModal}>확인</button>
                ) : (
                  <button className="findpw-login" onClick={navigateToLogin}>로그인 하기</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FindPw;