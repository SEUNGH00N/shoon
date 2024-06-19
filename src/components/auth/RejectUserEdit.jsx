import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/main.css';
import logo from '../../image/logo.png';
import serverHost from '../../utils/host';
import swal from 'sweetalert';
function RejectUserEdit() {
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
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    // 사용자 정보를 가져와서 formData에 설정하는 로직
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserData = async () => {
    try {
      // 서버에서 사용자 정보 가져오기
      const response = await fetch(`${serverHost}:8800/rejectUserEdit/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        // 사용자 정보를 formData에 설정
        setFormData({
          id: userData.user.id || '',
          name: userData.user.name || '',
          password: '', // 비밀번호는 보안상 빈 문자열로 설정
          confirmPassword: '', // 비밀번호 확인 필드도 빈 문자열로 설정
          email: userData.user.email || '',
          department: userData.user.department || '',
          grade: userData.user.grade || '',
          studentIdImage: null // 이미지는 재업로드해야하므로 초기화
        });
      } else {
        // 오류 처리
        console.error('Failed to fetch user data:', response.status);
        setErrorMessage('사용자 정보를 가져오는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setErrorMessage('사용자 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };


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
    const imageFileName = getImageFileName(formData.id, formData.studentIdImage);
    try {
      // FormData 객체 생성
      const formDataToSend = new FormData();

      // 사용자 정보 추가
      formDataToSend.append('id', formData.id);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('confirmPassword', formData.confirmPassword);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('department', formData.department);
      formDataToSend.append('grade', formData.grade);

      // 이미지 파일 추가
      formDataToSend.append('studentIdImage', formData.studentIdImage, imageFileName); // 이미지 추가 및 파일 이름 설정

      // 서버로 수정된 사용자 정보 및 이미지 전송
      const response = await fetch(`${serverHost}:8800/editUserData`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        // 수정 성공 시 처리
        await swal("수정 완료", "수정이 완료되었습니다. 승인을 기다려주세요!", "success");
        navigate('/Login'); // 수정 후 로그인 페이지로 이동
      } else {
        // 오류 처리
        const errorData = await response.json();
        swal("오류 발생", errorData.error, "error");
      }
    } catch (error) {
      console.error('Error editing user data:', error);
      setErrorMessage('서버와의 통신 중 오류가 발생했습니다.');
    }
  };


  return (
    <div>
      <a href="/Login">
        <img src={logo} id='logo' alt="로고" />
      </a>
      <h1 className="signup-header">정보 수정</h1>
      <div className="signup-container">
        {errorMessage && <p className="error-message">{errorMessage}</p>}
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

          <button type="submit" className="signup-button">수정 완료</button>
        </form>
      </div>
    </div>
  );
}

export default RejectUserEdit;
