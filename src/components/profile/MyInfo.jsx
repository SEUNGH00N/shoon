import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import '../../styles/myinfo.css';
import serverHost from '../../utils/host';
import Header from '../header/Header';
import swal from 'sweetalert';
import Footer from '../auth/Footer';

Modal.setAppElement('#root');

function UserEdit({ userInfo, onAccountDeleted }) {
  const [editedUserInfo, setEditedUserInfo] = useState({ ...userInfo });
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setEditedUserInfo({ ...editedUserInfo, [field]: value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${serverHost}:8800/edituserinfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: userInfo.id, editedUserInfo })
      });

      if (response.ok) {
        const data = await response.json();
        swal("성공", data.message, "success"); // 수정이 완료되었습니다. 메시지 표시
        navigate('/'); // Main 페이지로 이동
      } else {
        console.error('사용자 정보 수정 실패');
        swal("오류", "사용자 정보 수정 실패", "error");
      }
    } catch (error) {
      console.error('사용자 정보 수정 오류:', error);
      swal("오류", "사용자 정보 수정 중 오류가 발생했습니다.", "error");
    }
  };


  const handleDeleteAccount = () => {
    setIsModalOpen(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      const response = await fetch(`${serverHost}:8800/deleteaccount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: userInfo.id, password })
      });

      if (response.ok) {
        swal("성공", "회원 탈퇴되었습니다.", "success");
        sessionStorage.removeItem('userId');
        onAccountDeleted();
        navigate('/Login'); // Login 페이지로 이동
      } else {
        const data = await response.json();
        swal("오류", data.error, "error");
      }
    } catch (error) {
      console.error('회원 탈퇴 오류:', error);
      swal("오류", "회원 탈퇴 중 오류가 발생했습니다.", "error");
    }
  };


  return (
    <div className="user-edit">
      <h2 style={{ marginTop: '30px', marginBottom: '25px' }}>회원 정보 수정</h2>
      <p className="user-id">학번 : {userInfo.id}</p>
      <div className="form-group">
        <input
          type="text"
          value={editedUserInfo.name}
          placeholder="이름"
          onChange={(e) => handleChange('name', e.target.value)}
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          value={editedUserInfo.email}
          placeholder="이메일"
          onChange={(e) => handleChange('email', e.target.value)}
        />
      </div>
      <div className="select-group">
        <select
          name="department"
          value={editedUserInfo.department}
          onChange={(e) => handleChange('department', e.target.value)}
          style={{ color: editedUserInfo.department ? 'black' : 'gray' }}
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
          value={editedUserInfo.grade}
          onChange={(e) => handleChange('grade', e.target.value)}
          style={{ color: editedUserInfo.grade ? 'black' : 'gray' }}
          required
        >
          <option value="">학년을 선택하세요</option>
          <option value="1">1학년</option>
          <option value="2">2학년</option>
          <option value="3">3학년</option>
          <option value="4">4학년</option>
        </select>
      </div>
      <div>
        <button className="save-button" onClick={handleSave}>저장</button>
      </div>
      <button className="withdrawal-button" onClick={handleDeleteAccount}>회원 탈퇴</button>
      {/* 모달 */}
      <Modal className="withdrawal-modal" isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)}>
        <h2 className="withdrawal-title">회원 탈퇴</h2>
        <h3>회원 탈퇴와 함께 K'du-re에 등록된 모든 개인정보는</h3>
        <h3>삭제, 폐기 처리되며 복구되지 않습니다.</h3>
        <div className="form-group">
          <input
            type="password"
            className="withdrawal-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="회원탈퇴를 원하시면 비밀번호를 입력해주시길 바랍니다."
          />
        </div>
        <div className="modal-button-groupP">
          <button className="confirm-button" onClick={confirmDeleteAccount}>확인</button>
          <button className="cancel-button" onClick={() => setIsModalOpen(false)}>취소</button>
        </div>
      </Modal>
    </div>
  );
}

function MyInfo() {
  const [password, setPassword] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [isPasswordConfirmed, setIsPasswordConfirmed] = useState(false);

  const [, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [, setSavedSearchTerm] = useState('');
  const [, setShowSearchResults] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [, setSearchError] = useState('');
  const searchInputRef = useRef(null);
  const [, setShowRecentSearches] = useState(false);
  const navigate = useNavigate();

  const handleAddProduct = () => {
    navigate('/AddProducts');
  };

  const handleSearchProduct = async () => {
    if (!searchTerm) {
      setSearchError('검색어를 입력하세요.');
      // console.log('touch'); // 검색 인풋창 클릭시 "touch"를 콘솔에 출력
      return;
    }

    try {
      const response = await fetch(`${serverHost}:8800/products?search=${searchTerm}`);
      if (response.ok) {
        const data = await response.json();
        setFilteredProducts(data);
        setSavedSearchTerm(searchTerm);
        saveSearchTerm(searchTerm);
        setShowSearchResults(true);
        setSearchError('');

        // Navigate to the search results page
        navigate(`/searchResultsP/${encodeURIComponent(searchTerm)}`);

      } else {
        console.error('검색 오류:', response.status);
      }
    } catch (error) {
      console.error('검색 오류:', error);
    }
    // 검색어가 유효할 때 콘솔에 검색어 출력
    // console.log("검색어:", searchTerm);

  };

  const handleEnterKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchProduct();
    }
  };

  const saveSearchTerm = async (searchTerm) => {
    try {
      const userId = sessionStorage.getItem('userId');
      const response = await fetch(`${serverHost}:8800/searchHistory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ searchTerm, userId })
      });
      if (!response.ok) {
        console.error('검색어 저장 오류:', response.status);
      }
    } catch (error) {
      console.error('검색어 저장 오류:', error);
    }
  };

  const handleChangeSearchTerm = (event) => {
    setSearchTerm(event.target.value);
    setSearchError('');
  };

  const handleKeywordManagement = () => {
    navigate('/SearchKeyword');
  };

  const handleProductManagement = () => {
    navigate('/ProductManagement');
  };
  const handleShowWishlist = () => {
    navigate('/ShowWishlist');
  };
  const handleShowMyInfoPage = () => {
    navigate('/MyInfo');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userId');
    localStorage.removeItem('userId');
    navigate('/Login');
  };

  const handleShowChatList = () => {
    navigate('/ChatListComponent');
  };

  const toggleNavMenu = () => {
    setShowNavMenu(!showNavMenu);
  };

  const closeNavMenu = () => {
    setShowNavMenu(false);
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${serverHost}:8800/myinfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: sessionStorage.getItem('userId'), password })
      });
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
        setIsPasswordConfirmed(true);
      } else {
        swal("오류", "비밀번호가 일치하지 않습니다.", "error");
      }
    } catch (error) {
      console.error('내 정보 확인 오류:', error);
      swal("오류", "내 정보를 가져오는 중 오류가 발생했습니다.", "error");
    }
  };

  const handleAccountDeleted = () => {
    setIsPasswordConfirmed(false);
    setUserInfo(null);
  };

  return (
    <div className="container-main">
      <Header
        toggleNavMenu={toggleNavMenu}
        showNavMenu={showNavMenu}
        closeNavMenu={closeNavMenu}
        handleAddProduct={handleAddProduct}
        handleShowChatList={handleShowChatList}
        handleShowMyInfoPage={handleShowMyInfoPage}
        handleKeywordManagement={handleKeywordManagement}
        handleProductManagement={handleProductManagement}
        handleLogout={handleLogout}
        searchTerm={searchTerm}
        handleChangeSearchTerm={handleChangeSearchTerm}
        handleEnterKeyPress={handleEnterKeyPress}
        searchInputRef={searchInputRef}
        handleShowWishlist={handleShowWishlist}
        setShowRecentSearches={setShowRecentSearches}
        userInfo
        onSearchSubmit={handleSearchProduct}
        recentSearches={[]}
      />
      <div className="myinfo-page">
        <div className="myinfo-content">
          {isPasswordConfirmed ? (
            <>
              <aside className="myinfo-sidebar">
                <ul>
                  <li><a href="/ShowWishlist">찜한 상품</a></li>
                  <li><a href="/ProductManagement">등록한 상품</a></li>
                  <li><a href="/Payments">구매한 상품</a></li>
                  <li><a href="/ChangePw">비밀번호 변경</a></li>
                </ul>
              </aside>
              <div className="myinfo-container">
                {userInfo && <UserEdit userInfo={userInfo} onAccountDeleted={handleAccountDeleted} />}
              </div>
            </>
          ) : (
            <div className="myinfo-container">
              <form onSubmit={handleConfirm} className="password-form">
                <h3 className="input-password">비밀번호를 입력해주세요</h3>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  className="password-input"
                />
                <button type="submit" className="myinfo-button">확인</button>
              </form>
            </div>
          )}
        </div>
      </div>
      <Footer /> {/* Add Footer component here */}
    </div>
  );
}

export default MyInfo;