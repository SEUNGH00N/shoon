/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import ViewsList from '../products/ViewsList';
import SearchResults from '../header/SearchResults';
import ProductDetail from '../products/ProductDetail';
import ProductManagement from '../products/ProductManagement';
import ChatListComponent from '../messages/ChatListComponent';
import Header from '../header/Header';
import ShowWishlist from '../products/ShowWishlist';
import '../../styles/main.css';
import '../../styles/product.css';
import serverHost from '../../utils/host';
import Footer from './Footer';

function Main() {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [, setSavedSearchTerm] = useState('');
  const [, setShowSearchResults] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [searchError, setSearchError] = useState('');
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const [category, setCategory] = useState('');



  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

        navigate(`/searchResultsP/${encodeURIComponent(searchTerm)}`);
      } else {
        console.error('검색 오류:', response.status);
      }
    } catch (error) {
      console.error('검색 오류:', error);
    }

    console.log("검색어:", searchTerm);
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

  const handleKeywordManagement = () => navigate('/SearchKeyword');
  const handleProductManagement = () => navigate('/ProductManagement');
  const handleShowWishlist = () => navigate('/ShowWishlist');
  const handleShowMyInfoPage = () => navigate('/MyInfo');
  const handleLogout = () => {
    sessionStorage.removeItem('userId');
    localStorage.removeItem('userId');
    navigate('/Login');
  };
  const handleShowChatList = () => navigate('/ChatListComponent');
  const toggleNavMenu = () => setShowNavMenu(!showNavMenu);
  const closeNavMenu = () => setShowNavMenu(false);
  const handleMoreList = () => navigate('/LatestList');

  const filterProductsByCategory = async (category) => {
    try {
      const url = category ? `${serverHost}:8800/products?category=${category}` : `${serverHost}:8800/products`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setFilteredProducts(data);
        setShowSearchResults(true);
        setSearchError('');
      } else {
        console.error('카테고리별 정렬 오류:', response.status);
      }
    } catch (error) {
      console.error('카테고리별 정렬 오류:', error);
    }
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    console.log("Selected category:", selectedCategory); // Log the selected category
    setCategory(selectedCategory);
    filterProductsByCategory(selectedCategory);
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
      <div className="main">
        <section className="fleamarket-cover">
          <div className="cover-content">
            <h1 className="cover-title">믿을만한<br />교내 중고거래</h1>
            <span className="cover-description">학생들과 가깝고 따뜻한 거래를<br />지금 경험해보세요.</span>
            <div className="cover-image">
              <span className="fleamarket-cover-image">
                <img src="https://d1unjqcospf8gs.cloudfront.net/assets/home/main/3x/fleamarket-39d1db152a4769a6071f587fa9320b254085d726a06f61d544728b9ab3bd940a.webp" alt="믿을만한 이웃 간 중고거래" />
              </span>
            </div>
          </div>
        </section>
        <div className="form-group">
          <label htmlFor="category" style={{ marginTop: '30px' }}>카테고리별 정렬</label>
          <select id="category" value={category} onChange={handleCategoryChange}>
            <option value="">전체</option>
            <option value="1">디지털기기</option>
            <option value="2">가구/인테리어</option>
            <option value="3">의류</option>
            <option value="4">잡화</option>
            <option value="5">생활가전</option>
            <option value="6">생활/주방</option>
            <option value="7">스포츠/레저</option>
            <option value="8">뷰티/미용</option>
            <option value="9">가공식품</option>
          </select>
        </div>

        <div className="list-container">
        <ViewsList filteredProducts={filteredProducts} />
        </div>
        <div className="more-list">
          <button className="main-more-button" onClick={handleMoreList}>전체 상품 보기</button>
        </div>
        <Routes>
          <Route path="/ProductDetail/:productId" element={<ProductDetail />} />
          <Route path="/ProductManagement" element={<ProductManagement />} />
          <Route path="/ChatListComponent" element={<ChatListComponent />} />
          <Route path="/showWishlist" element={<ShowWishlist />} />
          <Route path="/SearchResults/:searchTerm" element={<SearchResults />} />
        </Routes>
        {searchError && (
          <p className="search-error">{searchError}</p>
        )}
      </div>
      {showNavMenu && <div className="overlay" onClick={closeNavMenu}></div>}
      <Footer />
    </div>
  );
}

export default Main;
