import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/main.css';
import logo from '../../image/logo.png';
import serverHost from '../../utils/host';
import Footer from './Footer';
function Signup() {
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    password: '',
    confirmPassword: '',
    email: '',
    department: '',
    grade: '',
    studentIdImage: null
  });
  const [, setIdAvailability] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // If the input type is file, handle it separately
    if (type === 'file') {
      setFormData(prevState => ({
        ...prevState,
        studentIdImage: e.target.files[0]
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  // 함수를 사용하여 이미지 파일 이름을 생성합니다.
  const getImageFileName = (userId, file) => {
    // 파일 확장자를 가져옵니다.
    const extension = file.name.split('.').pop();
    // 파일 이름을 사용자 ID와 확장자를 결합하여 반환합니다.
    return `${userId}.${extension}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 이미지 파일 이름을 생성합니다.
    const imageFileName = getImageFileName(formData.id, formData.studentIdImage);

    // 이미지를 포함한 FormData 생성
    const formDataWithImage = new FormData();
    formDataWithImage.append('id', formData.id);
    formDataWithImage.append('name', formData.name);
    formDataWithImage.append('password', formData.password);
    formDataWithImage.append('confirmPassword', formData.confirmPassword);
    formDataWithImage.append('email', formData.email);
    formDataWithImage.append('department', formData.department);
    formDataWithImage.append('grade', formData.grade);
    formDataWithImage.append('studentIdImage', formData.studentIdImage, imageFileName); // 이미지 추가 및 파일 이름 설정

    try {
      const response = await fetch(`${serverHost}:8800/signup`, {
        method: 'POST',
        body: formDataWithImage // FormData 전송
      });
      if (response.ok) {
        handleSignupSuccess();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error);
        setIsModalOpen(true); // 에러 발생 시 모달 열기
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('서버와의 통신 중 오류가 발생했습니다.');
      setIsModalOpen(true); // 에러 발생 시 모달 열기
    }
  };

  const handleSignupSuccess = () => {
    setSignupSuccess(true);
    setErrorMessage('');
    navigate('/Login');
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setErrorMessage('');
  };

  const handleCheckAvailability = async () => {
    try {
      const response = await fetch(`${serverHost}:8800/checkUser?id=${formData.id}`);
      if (response.ok) {
        const data = await response.json();
        setIdAvailability(data.available);
        setIsModalOpen(true);
        setErrorMessage(data.available ? '사용 가능한 아이디입니다!' : '이미 존재하는 아이디입니다!');
      } else {
        setIdAvailability(null);
        setErrorMessage('아이디 중복 확인 중 오류가 발생했습니다.');
        setIsModalOpen(true); // Open modal on error
      }
    } catch (error) {
      console.error('Error:', error);
      setIdAvailability(null);
      setErrorMessage('서버와의 통신 중 오류가 발생했습니다.');
      setIsModalOpen(true); // Open modal on error
    }
  };

  const handleKeyDown = (e) => {
    const allowedKeys = [8, 46, 37, 39, 9]; // 백스페이스, Delete, 왼쪽 화살표, 오른쪽 화살표, Tab 키코드
    const charCode = e.which ? e.which : e.keyCode;
    if ((charCode < 48 || charCode > 57) && !allowedKeys.includes(charCode)) {
      e.preventDefault();
    }
  };

  const handleInput = (e) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^0-9]/g, '');
    setFormData(prevState => ({
      ...prevState,
      id: filteredValue
    }));
  };

  return (
    <div>
      <a href="/Login">
        <img src={logo} id='logo' alt="로고" />
      </a>
      <h1 className="signup-header">회원가입</h1>
      <div className="signup-container">
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <p>{errorMessage}</p>
              <button className="modal-close" onClick={handleModalClose}>확인</button>
            </div>
          </div>
        )}
        {signupSuccess && <p className="success-message">회원가입 성공</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="이름"
              required
            />
          </div>
          <div className="form-group id-group">
            <div className="id-form">
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
            <button type="button" className="check" onClick={handleCheckAvailability}>중복 확인</button>
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
          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="비밀번호 확인"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일"
              required
            />
          </div>
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

          <div className="form-group">
            <input
              type="file"
              name="studentIdImage"
              onChange={handleChange}
              accept="image/*"
              required
            />
          </div>

          <button type="submit" className="signup-button">가입하기</button>
        </form>
        <p>이미 계정이 있으신가요?&nbsp;&nbsp;<Link to="/Login">로그인</Link></p>
      </div>
      <Footer /> {/* Add Footer component here */}
    </div>
  );
}

export default Signup;