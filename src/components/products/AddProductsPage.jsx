import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/product.css';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import Header from '../header/Header';
import serverHost from '../../utils/host';
import swal from 'sweetalert';
import Footer from '../auth/Footer';
function AddProducts() {
  const userId = sessionStorage.getItem('userId');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priceError, setPriceError] = useState('');
  const [image, setImage] = useState(null); // 이미지 파일 상태 추가
  const [imagePreview, setImagePreview] = useState(null); // State for image preview
  const [setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [setSavedSearchTerm] = useState('');
  const [setShowSearchResults] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [setSearchError] = useState('');
  const [descriptionCharCount, setDescriptionCharCount] = useState(0);
  const searchInputRef = useRef(null);
  const [, setShowRecentSearches] = useState(false);
  const [categoryId, setCategoryId] = useState(''); // 카테고리 상태 변수 추가

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    // 엔터키 입력 감지
    if (event.key === 'Enter') {
      event.preventDefault(); // 기본 엔터키 동작 방지
      // 현재 설명값에 엔터키 추가하여 설정
      setDescription(prevDescription => prevDescription + '\n');
      setDescriptionCharCount(prevCount => prevCount + 1);
    } else {
      const newDescription = event.target.value;
      if (newDescription.length <= 1000) {
        setDescription(newDescription);
        setDescriptionCharCount(newDescription.length);
      }
    }
  };

  const handlePriceChange = (event) => {
    const value = event.target.value;
    if (/^\d*$/.test(value) && value.length <= 8) {
      setPrice(value);
      setPriceError('');
    } else {
      setPriceError('가격은 숫자 8자리까지만 입력 가능합니다.');
    }
  };

  // 이미지 변경 이벤트를 처리하는 함수
  const handleImageChange = (event) => {
    // 사용자가 선택한 첫 번째 파일을 가져옴
    const selectedImage = event.target.files[0];

    // 파일이 선택되었는지 확인
    if (selectedImage) {
      // 선택한 이미지 파일로 상태를 업데이트
      setImage(selectedImage);

      // 파일을 읽기 위해 새로운 FileReader 객체 생성
      const reader = new FileReader();

      // FileReader의 onload 이벤트 핸들러 정의
      reader.onload = () => {
        // base64 인코딩된 이미지 미리보기로 상태를 업데이트
        setImagePreview(reader.result);
      };

      // 선택한 이미지 파일을 Data URL(베이스64 인코딩된 문자열)로 읽기
      reader.readAsDataURL(selectedImage);
    } else {
      // 파일이 선택되지 않은 경우, 이미지와 미리보기에 대한 상태를 초기화
      setImage(null);
      setImagePreview(null);
    }
  };


  const handleAddProduct = async (event) => {
    event.preventDefault();

    if (!name || !description || !price || !image) {
      swal({
        title: "입력 오류",
        text: "모든 필드를 입력해 주세요.",
        icon: "error",
      });
      return;
    }


    if (priceError) {
      swal({
        title: "입력 오류",
        text: "가격 입력을 확인해 주세요.",
        icon: "warning",
      });

      return;
    }
    // 상품 추가 요청
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('image', image); // 이미지 파일 추가
      formData.append('category_id', categoryId); // 카테고리 추가

      const response = await fetch(`${serverHost}:8800/addProduct`, {
        method: 'POST',
        headers: {
          'user_id': userId,
        },
        body: formData,
      });

      if (response.ok) {
        // 상품 추가 성공 시 폼 초기화
        setName('');
        setDescription('');
        setPrice('');
        setImage(null); // 이미지 파일 초기화
        // 상품 추가 후 메인 페이지로 이동
        setImagePreview(null); // 이미지 프리뷰 초기화
        swal({
          title: "성공",
          text: "상품이 추가되었습니다.",
          icon: "success",
        }).then(() => {
          // 상품 추가 후 메인 페이지로 이동
          navigate('/Main');
        });

      } else {
        // 상품 추가 실패 시 오류 메시지 출력
        console.error('상품 추가 실패:', response.statusText);
      }
    } catch (error) {
      // 네트워크 오류 등의 문제 발생 시 오류 메시지 출력
      console.error('상품 추가 오류:', error);
    }
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

  const handleCategoryChange = (e) => {
    setCategoryId(e.target.value);
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
      <div className="add-container">
        <form onSubmit={handleAddProduct}>
          <div className="image-upload">
            <label htmlFor="image" style={{ marginBottom: '10px' }}>상품 이미지</label>
            <label htmlFor="imageInput">
              {imagePreview ? (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Product Preview" className="preview-image" />
                </div>
              ) : (
                <div className="no-image-preview">
                  <CameraAltIcon fontSize="large" />
                  <span>이미지 등록</span>
                </div>
              )}
            </label>
            <input type="file" onChange={handleImageChange} id="imageInput" accept="image/*" style={{ display: 'none' }} />
          </div>

          <div className="form-group">
            <label htmlFor="name" style={{ marginTop: '30px' }}>상품명</label>
            <input type="text" placeholder="상품명을 입력해 주세요." value={name} onChange={handleNameChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="description" style={{ marginTop: '30px' }}>상품 설명</label>
            <textarea
              id="description"
              placeholder={"브랜드, 모델명, 구매시기, 하자 유무 등 상품 상품 설명을 최대한 자세히 적어주세요.\n전화번호, SNS 계정 등 개인정보 입력은 제한될 수 있습니다."}
              value={description}
              onChange={handleDescriptionChange}
            />
            <p className="char-count">{descriptionCharCount} / 1000</p> {/* Character count display */}
          </div>
          <div className="form-group">
            <label htmlFor="price">가격</label>
            <div className="price-input">
              <input
                type="price"
                placeholder="가격을 입력해 주세요."
                value={price}
                onChange={handlePriceChange}
                required
              />
              <span>원</span>
            </div>
            <div className="category-form-group">
              <label htmlFor="category" style={{ marginTop: '30px' }}>카테고리</label>
              <select id="category" value={categoryId} onChange={handleCategoryChange} required>
                <option value="">카테고리를 선택해 주세요</option>
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
            {priceError && <p className="error-message">{priceError}</p>}
          </div>


          <button type="submit" className="add-product-button">추가</button>
        </form>
      </div>
      <Footer /> {/* Add Footer component here */}
    </div>
  );
}

export default AddProducts;