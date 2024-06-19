import React, { useState, useEffect, useRef } from 'react';
import { Route, Routes, useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import ProductManagement from '../products/ProductManagementForm';
import ProductDetail from '../products/ProductDetail';
import ChatListComponent from '../messages/ChatListComponent';
import ShowWishlist from '../products/ShowWishlist';
import VisibilityIcon from '@mui/icons-material/Visibility';
import '../../styles/product.css';
import serverHost from '../../utils/host';

const SearchResults = () => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [formattedProducts, setFormattedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { searchTerm: urlSearchTerm } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [, setSearchError] = useState('');
  const [showNavMenu, setShowNavMenu] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!urlSearchTerm) return;
      try {
        const response = await fetch(`${serverHost}:8800/products?search=${urlSearchTerm}`);
        if (response.ok) {
          const data = await response.json();
          const updatedProducts = data.map(product => ({
            ...product,
            imageUrl: `${serverHost}:8800/uploads/${product.image}`
          }));
          setFilteredProducts(updatedProducts);
          setLoading(false);
        } else {
          console.error('Failed to fetch search results');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setLoading(false);
      }
    };
    fetchSearchResults();
  }, [urlSearchTerm]);

  useEffect(() => {
    const formatDate = (createdAt) => {
      const currentTime = new Date();
      const productTime = new Date(createdAt);
      const timeDifference = Math.floor((currentTime - productTime) / (1000 * 60));

      if (timeDifference < 30) {
        return '방금 전';
      } else if (timeDifference < 60 * 24) {
        return `${Math.floor(timeDifference / 60)}시간 전`;
      } else if (timeDifference < 60 * 24 * 7) {
        return `${Math.floor(timeDifference / (60 * 24))}일 전`;
      } else if (timeDifference < 60 * 24 * 30) {
        return `${Math.floor(timeDifference / (60 * 24 * 7))}주 전`;
      } else {
        return '한달 ↑';
      }
    };

    const formatted = filteredProducts.map(product => ({
      ...product,
      formattedCreatedAt: formatDate(product.createdAt),
    }));
    setFormattedProducts(formatted);
  }, [filteredProducts]);

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

  const handleSearchProduct = async () => {
    if (!searchTerm.trim()) {
      setSearchError('검색어를 입력하세요.');
      return;
    }
    try {
      const response = await fetch(`${serverHost}:8800/products?search=${searchTerm}`);
      if (response.ok) {
        const data = await response.json();
        const updatedProducts = data.map(product => ({
          ...product,
          imageUrl: `${serverHost}:8800/uploads/${product.image}`
        }));
        setFilteredProducts(updatedProducts);
        setLoading(false);
        navigate(`/searchResultsP/${encodeURIComponent(searchTerm)}`);
      } else {
        console.error('검색 오류:', response.status);
      }
    } catch (error) {
      console.error('검색 오류:', error);
    }
  };

  const handleEnterKeyPress = event => {
    if (event.key === 'Enter') {
      handleSearchProduct();
    }
  };

  const handleChangeSearchTerm = event => {
    setSearchTerm(event.target.value);
    setSearchError('');
  };

  const handleAddProduct = () => {
    navigate('/AddProducts');
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
      <div className="main-container">
        {urlSearchTerm ? (
          <h2>검색 결과</h2>
        ) : (
          <h2>검색어를 입력하세요.</h2>
        )}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="product-list-container">
            <div className="product-list-wrapper">
              <div className="product-grid">
                {filteredProducts.length === 0 ? (
                  <p className="no-results-message">검색하신 상품이 없습니다!</p>
                ) : (
                  formattedProducts.map((product) => (
                    <div key={product.id} className="product-item" onClick={(e) => handleProductClick(e, product.id)}>
                      <div className="product-image-container">
                        {product.image && (
                          <img
                            src={`${serverHost}:8800/uploads/${extractImageFilename(product.image)}`}
                            alt={product.name}
                            className="product-image"
                          />
                        )}
                      </div>
                      <div className="product-details">
                        <p className="product-name">{product.name}</p>
                        <p className="product-price">
                          <span style={{ fontSize: '20px', fontWeight: 550 }}>{product.price}</span> 원
                        </p>
                        <div className="product-views">
                          <VisibilityIcon sx={{ fontSize: 15, marginRight: 0.5, marginBottom: -0.3 }} />
                          {product.views}
                        </div>
                        <div className="product-time">
                          <p> {product.formattedCreatedAt}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        )}
      </div>
      <Routes>
        <Route path="/ProductDetail/:productId" element={<ProductDetail />} />
        <Route path="/ProductManagement" element={<ProductManagement />} />
        <Route path="/ChatListComponent" element={<ChatListComponent />} />
        <Route path="/showWishlist" element={<ShowWishlist />} />
        <Route path="/searchResultsP/:searchTerm/*" element={<SearchResults />} />
      </Routes>
    </div>
  );
};

const extractImageFilename = (imageUrl) => {
  const parts = imageUrl.split('/');
  return parts[parts.length - 1];
};

export default SearchResults;