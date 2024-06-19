import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../header/Header';
import '../../styles/product.css';
import serverHost from '../../utils/host';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import Footer from '../auth/Footer';
const ShowWishlist = () => {
  const userId = sessionStorage.getItem('userId');
  const [wishlistItems, setWishlistItems] = useState([]);
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [, setSavedSearchTerm] = useState('');
  const [, setShowSearchResults] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [, setSearchError] = useState('');
  const [, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchWishlistItems = async () => {
      try {
        const response = await fetch(`${serverHost}:8800/favorites?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setWishlistItems(data);
        } else {
          console.error('Error fetching wishlist items:', response.status);
        }
      } catch (error) {
        console.error('Error fetching wishlist items:', error);
      }
    };

    fetchWishlistItems();
  }, [userId]);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        const updatedItems = await Promise.all(
          wishlistItems.map(async (product) => {
            const favoriteResponse = await fetch(`${serverHost}:8800/products/isFavorite/${userId}/${product.product_id}`);
            if (favoriteResponse.ok) {
              const { isFavorite } = await favoriteResponse.json();
              return { ...product, isFavorite };
            } else {
              console.error('찜 상태 확인 실패:', favoriteResponse.status);
              return product;
            }
          })
        );
        setWishlistItems(updatedItems);
      } catch (error) {
        console.error('찜 상태 확인 오류:', error);
      }
    };

    if (wishlistItems.length > 0) {
      fetchFavoriteStatus();
    }
  }, [wishlistItems, userId]);

  const handleProductClick = (productId) => {
    navigate(`/ProductDetail/${productId}`);
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

        navigate(`/SearchResultsP/${encodeURIComponent(searchTerm)}`);
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

  const handleToggleFavorite = async (productId) => {
    try {
      const response = await fetch(`${serverHost}:8800/products/toggleFavorite/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const data = await response.json();
        setWishlistItems((prevItems) =>
          prevItems.map((item) =>
            item.product_id === productId ? { ...item, isFavorite: data.isFavorite } : item
          )
        );
      } else {
        console.error('찜 상태 토글 실패:', response.status);
      }
    } catch (error) {
      console.error('찜 상태 토글 오류:', error);
    }
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
      <h1 className="wishlist-title">찜 목록</h1>
      <div className="wishlist-container">
        {wishlistItems.map((product) => (
          <div key={product.id} className="wishlist-item">
            <div className="wishlist-badge" onClick={() => handleToggleFavorite(product.product_id)}>
              {product.isFavorite ? <Favorite /> : <FavoriteBorder />}
            </div>
            <img
              src={`${serverHost}:8800/uploads/${product.image}`}
              alt={product.product_name}
              className="wish-image"
              onClick={() => handleProductClick(product.product_id)}
            />
            <div className="wish-details">
              <p className="wish-name">
                <span className="wish-name-text">{product.product_name}</span>
              </p>
              <p className="wish-price">
                <span className="wish-price-text">{product.price.toLocaleString()}원</span>
              </p>
            </div>
          </div>
        ))}
      </div>
      <Footer /> {/* Add Footer component here */}
    </div>
  );
};
export default ShowWishlist;