import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/login.css';
import naver from '../../image/naver.png';
import kakao from '../../image/kakao.png';
import logo from '../../image/logo.png';
import serverHost from '../../utils/host';
import swal from 'sweetalert';
import Footer from './Footer';
// Login 컴포넌트 정의
function Login() {
  // formData 상태 관리(state) 초기화
  const [formData, setFormData] = useState({
    id: '',
    password: ''
  });

  // 로그인 상태 관리
  const [loginSuccess, setLoginSuccess] = useState(true);
  // 승인 대기 상태 관리
  const [, setPendingUser] = useState(false);
  const [, setIsAdmin] = useState(false);

  // 페이지 이동 기능을 위한 navigate 함수 사용
  const navigate = useNavigate();

  // 입력 필드 값이 변경될 때마다 formData 객체 업데이트
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  // 로그인 폼 제출 시 수행되는 비동기 처리 함수
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${serverHost}:8800/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('userId', data.id);
        sessionStorage.setItem('isAdmin', data.isAdmin.toString());
        localStorage.setItem('userId', data.id);
        localStorage.setItem('isAdmin', data.isAdmin.toString());

        if (data.isAdmin) {
          setIsAdmin(true);
          showAdminOption();
        } else {
          navigate('/Main'); // 일반 사용자 페이지로 이동
          sessionStorage.setItem('isAdmin', 'false'); // 일반 사용자 세션 저장
        }

      } else {
        console.error('로그인 실패:', response.status);
        setLoginSuccess(false);
        if (response.status === 403) {
          const responseData = await response.json();
          if (responseData.error === '승인 대기 중입니다. 관리자의 승인을 기다려주세요.') {
            setPendingUser(true);
            swal({
              title: "승인 대기 중입니다.",
              text: "관리자의 승인을 기다려주세요.",
              icon: "info",
              html: true
            });
          } else {
            const rejectionReason = responseData.rejectionReason || '관리자에게 문의하세요.';
            swal({
              title: "승인이 거절되었습니다.",
              text: `사유: ${rejectionReason}`,
              icon: "error",
              buttons: {
                cancel: "닫기",
                editProfile: {
                  text: "프로필 수정하기",
                  value: "editProfile",
                },
              },
            }).then((value) => {
              if (value === "editProfile") {
                // rejectuseredit 페이지로 이동하는 로직 추가
                navigate(`/RejectUserEdit/${formData.id}`); // 사용자 ID와 함께 RejectUserEdit 페이지로 이동
              }
            });
          }
        }
      }

    } catch (error) {
      console.error('로그인 오류:', error);
      setLoginSuccess(false);
    }
  };

  const handleKeyDown = (e) => {
    const allowedKeys = [8, 46, 37, 39, 9]; // 백스페이스, Delete, 왼쪽 화살표, 오른쪽 화살표, Tab 키코드
    const charCode = e.which ? e.which : e.keyCode;

    // 일반 숫자 키와 숫자패드 숫자 키를 모두 허용
    if (!((charCode >= 48 && charCode <= 57) ||
      (charCode >= 65 && charCode <= 90) ||
      (charCode >= 97 && charCode <= 122) ||
      (charCode >= 96 && charCode <= 105) ||
      allowedKeys.includes(charCode))) {
      e.preventDefault();
    }
  };


  const handleInput = (e) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^0-9a-zA-Z]/g, '');
    setFormData(prevState => ({
      ...prevState,
      id: filteredValue
    }));
  };


  // 네이버 로그인 버튼 클릭 시 수행되는 함수
  const handleNaverLogin = () => {
    const state = generateRandomState();

    // 세션 스토리지에 state 값 저장
    sessionStorage.setItem('oauthState', state);

    // 네이버 OAuth 인증 요청 URL 생성
    const naverOAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=r59ZbtMFYtVGcCmLsGj5&redirect_uri=${serverHost}:8800/oauth/naver/callback&state=${state}`;

    // OAuth 인증 요청
    window.location.href = naverOAuthUrl;
  };

  // 랜덤 state 값 생성 함수
  const generateRandomState = () => {
    return Math.random().toString(36).substring(7);
  };

  const handleKakaoLogin = () => {
    const clientId = '0bee6abe1a644025c9faedffda0ddd04';
    const redirectUri = `${serverHost}:8800/oauth/kakao/callback`;
    const responseType = 'code';

    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}`;

    // 리다이렉트하여 카카오 OAuth 인증 요청을 시작
    window.location.href = kakaoAuthUrl;
  };

  // 회원가입 버튼 클릭 시 호출되는 함수
  const handleSignup = () => {
    navigate('/Signup');
  };

  // 아이디 찾기 버튼 클릭 시 호출되는 함수
  const handleFindId = () => {
    navigate('/FindId');
  };

  // 비밀번호 찾기 버튼 클릭 시 호출되는 함수
  const handleFindPassword = () => {
    navigate('/FindPw');
  };

  const showAdminOption = useCallback(() => {
    swal({
      title: "관리자 모드",
      text: "환영합니다!",
      icon: "info",
      buttons: {
        admin: {
          text: "관리자 페이지",
          value: "admin",
          className: "admin-button" // 추가한 부분

        },
        main: {
          text: "메인 페이지",
          value: "main",
          className: "admin-button" // 추가한 부분
        },
      },
      className: "admin-button" // 추가한 부분
    })
      .then((value) => {
        if (value === "admin") {
          navigate('/AdminPage');
        } else {
          navigate('/Main');
        }
      });
  }, [navigate]);

  // 컴포넌트가 처음 렌더링될 때 세션 스토리지 확인 및 자동 로그인
  useEffect(() => {
    let userId = sessionStorage.getItem('userId');
    let isAdmin = sessionStorage.getItem('isAdmin') === 'true';
  
    if (!userId) {
      userId = localStorage.getItem('userId');
      isAdmin = localStorage.getItem('isAdmin') === 'true';
  
      if (userId) {
        sessionStorage.setItem('userId', userId);
        sessionStorage.setItem('isAdmin', isAdmin.toString());
      }
    }
  
    console.log(`User ID: ${userId}, Is Admin: ${isAdmin}`);
  
    if (userId) {
      if (isAdmin) {
        setIsAdmin(true);
        showAdminOption();
      } else {
        navigate('/Main');
      }
    }
  }, [navigate, showAdminOption]);

  return (
    <div className="container-login">
      <img src={logo} id='login-logo' alt="로고" />
      <div className="login-container">
        <h1 className="login-header">L O G I N</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              onInput={handleInput}
              placeholder="학번"
              maxLength="7" // 최대 7자리까지만 입력 가능
              onKeyDown={handleKeyDown} // 숫자 이외의 입력을 막기
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호"
              required
            />
          </div>
          {!loginSuccess && (
            <p className="login-failure-message">아이디 또는 비밀번호가 올바르지 않습니다.</p>
          )}
          <button type="submit" className="login-button">로그인</button>
          <div className="all-group">
            <button type="button" className="signup" onClick={handleSignup}>회원가입</button>
            <button type="button" className="find-id" onClick={handleFindId}>아이디 찾기</button>
            <button type="button" className="find-pw" onClick={handleFindPassword}>비밀번호 찾기</button>
          </div>
          <div className="rest-group">
            <button type="button" src={naver} alt="naver" className="naver-login" onClick={handleNaverLogin}></button>
            <button type="button" src={kakao} alt="kakao" className="kakao-login" onClick={handleKakaoLogin}></button>
          </div>
        </form>
      </div>
      <Footer /> {/* Add Footer component here */}
    </div>
  );
}

export default Login;