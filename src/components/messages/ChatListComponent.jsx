import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/chat.css';
import '../../styles/chatList.css';
import ChatModal from './ChatModal';
import Header from '../header/Header';
import serverHost from '../../utils/host';

const ChatListComponent = () => {
  const userId = sessionStorage.getItem('userId');
  const userType = sessionStorage.getItem('userType');
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedRoomProductId, setSelectedRoomProductId] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [, setSavedSearchTerm] = useState('');
  const [, setShowSearchResults] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [, setSearchError] = useState('');
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [, setFilteredProducts] = useState([]);

  useEffect(() => {
    fetchChatRooms();
  }, [userId, userType]);

  const fetchChatRooms = async () => {
    try {
      const response = await fetch(`${serverHost}:4001/myChatRooms`, {
        headers: {
          'user_id': userId,
          'user_type': userType
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch chat rooms');
      }
      const data = await response.json();
      setChatRooms(data);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    }
  };

  const openChat = (chatRoomId, productId) => {
    setSelectedRoomId(chatRoomId);
    setSelectedRoomProductId(productId);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setSelectedRoomId(null);
    setSelectedRoomProductId(null);
    setIsChatOpen(false);
  };
  const handleAddProduct = () => {
    navigate('/AddProducts');
  };

  const handleSearchProduct = async () => {
    if (!searchTerm) {
      setSearchError('검색어를 입력하세요.');
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
      } else {
        console.error('검색 오류:', response.status);
      }
    } catch (error) {
      console.error('검색 오류:', error);
    }
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
  

  const handleShowWishlist = () => {
    navigate('/ShowWishlist');
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
      />
      <div className="chatsidebar-container">
        <div className="chatsidebar">
          <h2 className="chat-heading">채팅</h2>
          {chatRooms.length === 0 ? (
            <p className="loading-text">채팅방을 로딩하는 중입니다.</p>
          ) : (
            <ul className="chat-room-list">
              {chatRooms.map((chatRoom) => (
                <li key={chatRoom.id} className={selectedRoomId === chatRoom.id ? 'selected' : 'chat-room-item'}>
                  <button onClick={() => openChat(chatRoom.id, chatRoom.productId)} className="chat-room-button">
                    <div className="chat-room-info">
                      <span className="chat-room-name">상품명 : {chatRoom.productName}</span>
                      <span className="last-message">{chatRoom.lastMessage}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {isChatOpen && (
          <div className={`chat-window ${isChatOpen ? 'chat-open' : ''}`}>
            <ChatModal chatRoomId={selectedRoomId} productId={selectedRoomProductId} closeChat={closeChat} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatListComponent;