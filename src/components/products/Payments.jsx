import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Header from '../header/Header';
import serverHost from '../../utils/host';
import Footer from '../auth/Footer';
import '../../styles/payments.css';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = sessionStorage.getItem('userId');
  const navigate = useNavigate();
  const [, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [, setSavedSearchTerm] = useState('');
  const [, setShowSearchResults] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [, setSearchError] = useState('');

  const searchInputRef = useRef(null);
  const [, setShowRecentSearches] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch(`${serverHost}:8800/payments/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }
        const data = await response.json();
        // createdAt을 기준으로 내림차순으로 정렬
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPayments(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching payments:', error.message);
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, [userId]);
  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      
    });
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

  const handleAddProduct = () => {
    navigate('/AddProducts');
  };

  const handleSearchProduct = async () => {
    if (!searchTerm) {
      setSearchError('검색어를 입력하세요.');
      // console.log('touch');
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

        navigate(`/searchResultsP/${encodeURIComponent(searchTerm)}`);
      } else {
        console.error('검색 오류:', response.status);
      }
    } catch (error) {
      console.error('검색 오류:', error);
    }

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

  const handleProductClick = async (event, productId) => {
    event.preventDefault(); // 기본 동작 막기

    const viewedProductKey = `viewed_product_${productId}`;

    // 세션 스토리지에서 해당 상품의 조회 기록 확인
    const isProductViewed = sessionStorage.getItem(viewedProductKey);

    if (!isProductViewed) {
      try {
        // 서버에 조회수 업데이트 요청
        await fetch(`${serverHost}:8800/updateViews/${productId}`, {
          method: 'POST',
        });

        // 세션 스토리지에 조회 기록 저장
        sessionStorage.setItem(viewedProductKey, 'true');
      } catch (error) {
        console.error('Error updating views:', error);
      }
    }

    // 상품 상세 페이지로 이동
    navigate(`/ProductDetail/${productId}`);
  };

  return (
    <div className='container-main'>
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
      />
      <Container className="my-4" style={{ minHeight: '600px' }}>
        <h1 className="mb-4">최근 구매 내역</h1>
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
          ) : payments.length === 0 ? (
            <div>
              <h4>결제 내역이 없습니다.</h4>
            </div>
          ) : (
        
          <Row>
            {payments.map((payment) => (
              <Col md={6} lg={3} key={payment.id} className="mb-4">
                <Card onClick={(e) => handleProductClick(e, payment.product_id)} style={{ cursor: 'pointer' }}>
                  <Card.Body>
                    <Card.Title>{payment.productName}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">주문 번호: {payment.orderId}</Card.Subtitle>
                    <Card.Text>금액: {parseInt(payment.amount).toLocaleString()}원</Card.Text>
                    <Card.Text>구매일: {formatDate(payment.createdAt)}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
      <Footer /> {/* Add Footer component here */}
    </div>
  );
};

export default Payments;
