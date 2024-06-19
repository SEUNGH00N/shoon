/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import serverHost from '../../utils/host';
import Header from '../header/Header';
import Footer from '../auth/Footer';
import Swal from 'sweetalert2';
import swal from 'sweetalert';
import IconButton from '@mui/material/IconButton';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';


function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [, setSavedSearchTerm] = useState('');
  const [, setShowSearchResults] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [searchError, setSearchError] = useState('');
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [, setShowRecentSearches] = useState(false);
  const [, setFormattedProducts] = useState([]);
  const userId = sessionStorage.getItem('userId');
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${serverHost}:8800/productsmanage`, {
        headers: {
          'user_id': sessionStorage.getItem('userId')
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('상품 목록 가져오기 오류:', response.status);
      }
    } catch (error) {
      console.error('상품 목록 가져오기 오류:', error);
    }
  };

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

  useEffect(() => {
    const formatDate = (createdAt) => {
      const currentTime = new Date();
      const productTime = new Date(createdAt);
      const timeDifference = Math.floor((currentTime - productTime) / (1000 * 60)); // milliseconds to minutes

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

    const formatted = products.map(product => ({
      ...product,
      formattedCreatedAt: formatDate(product.createdAt),
    }));
    setFormattedProducts(formatted);
  }, [products]);

  const handleProductClick = (productId) => {
    return (e) => {
      e.preventDefault();

      Swal.fire({
        title: '어떤 작업을 원하세요?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-info-circle"></i> 상세 페이지',
        cancelButtonText: '<i class="fas fa-edit"></i> 수정 페이지',
        customClass: {
          title: 'my-custom-font',
          confirmButton: 'btn btn-success swal-confirm',
          cancelButton: 'btn btn-warning swal-cancel',
        },
        buttonsStyling: false,
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = `/ProductDetail/${productId}`;
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          window.location.href = `/ProductManagementForm/${productId}`;
        }
      });
    };
  };

  const handleDeleteClick = async (productId) => {
    const confirmDeletion = await swal({
      title: "정말로 삭제하시겠습니까?",
      text: "삭제된 상품은 복구할 수 없습니다.",
      icon: "warning",
      buttons: {
        confirm: {
          text: "확인",
          value: true,
          visible: true,
          className: "btn btn-danger", // 기본 버튼 스타일 적용
          closeModal: true,
        },
        cancel: {
          text: "닫기",
          value: null,
          visible: true,
          className: "btn btn-secondary",
          closeModal: true,
        },
      },
      customClass: {
        confirmButton: 'text-white', // 커스텀 클래스 적용
      },
      dangerMode: true,
    });



    if (confirmDeletion) {
      try {
        const response = await fetch(`${serverHost}:8800/productsmanage/${productId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'user_id': userId, // 실제 사용자 ID를 여기에 넣어야 함
          },
        });

        if (response.ok) {
          setProducts(products.filter(product => product.id !== productId));
          await swal("성공", "상품이 성공적으로 삭제되었습니다.", "success");
        } else {
          const errorData = await response.json();
          swal("오류", `상품 삭제 중 오류가 발생했습니다: ${errorData.error}`, "error");
        }
      } catch (error) {
        console.error('상품 삭제 오류:', error);
        swal("오류", "상품 삭제 중 오류가 발생했습니다.", "error");
      }
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
        setShowRecentSearches={setShowRecentSearches}
        userInfo
        onSearchSubmit={handleSearchProduct}
        recentSearches={[]}
      />
      <div className='h2-font'>
        <h2>내가 등록한 상품</h2>
        <div className="cards-wrap1">
          {products.length === 0 ? (
            <div className="no-products">

            </div>

          ) : (
            products.map((product) => (
              <article className="card-top" key={product.id} style={{ position: 'relative' }}>
                <a
                  href="#"
                  className="card-link-1"
                  data-event-label={product.id}
                  onClick={handleProductClick(product.id)}
                >
                  <div className="card-photo">
                    <img
                      src={`${serverHost}:8800/uploads/${product.image}`}
                      alt={product.title}
                    />
                  </div>
                  <div className="card-desc">
                    <h2 className="card-title">{product.name}</h2>
                    <div className="card-price">{product.price}원</div>

                  </div>

                </a>
                <IconButton
                  style={{ position: 'absolute', top: '260px', right: '5px' }}
                  onClick={() => handleDeleteClick(product.id)}
                >
                  <HighlightOffIcon fontSize='medium' color="error" />
                </IconButton>

              </article>
            ))
          )}
        </div>
      </div>

      {
        searchError && (
          <p className="search-error">{searchError}</p>
        )
      }
      <Footer /> {/* Add Footer component here */}
    </div >
  );
}

export default ProductManagement