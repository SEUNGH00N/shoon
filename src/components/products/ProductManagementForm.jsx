/* eslint-disable react/style-prop-object */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/product.css';
import Header from '../header/Header';
import serverHost from '../../utils/host';
import swal from 'sweetalert';

const ProductManagementForm = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [, setSavedSearchTerm] = useState('');
  const [, setShowSearchResults] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [, setSearchError] = useState('');
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [, setFilteredProducts] = useState([]);
  const [editedProduct, setEditedProduct] = useState(null);
  const [, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [descriptionCharCount, setDescriptionCharCount] = useState(0);
  const [imageFile, setImageFile] = useState(null); // State variable for the selected image file
  const [imagePreview, setImagePreview] = useState(null); // State variable for the image preview

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`${serverHost}:8800/productsD/${productId}`, {
          headers: {
            'user_id': sessionStorage.getItem('userId')
          }
        });
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          setEditedProduct({ ...data });
        } else {
          console.error('상품 정보 가져오기 오류:', response.status);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('상품 정보 가져오기 오류:', error);
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  useEffect(() => {
    sessionStorage.setItem('productId', productId);
  }, [productId]);

  if (!product) {
    return <div className="loading">Loading...</div>;
  }

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
        console.error('Search error:', response.status);
      }
    } catch (error) {
      console.error('Search error:', error);
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm, userId }),
      });
      if (!response.ok) {
        console.error('Error saving search term:', response.status);
      }
    } catch (error) {
      console.error('Error saving search term:', error);
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

  const handleShowWishlist = () => {
    navigate('/ShowWishlist');
  };

  const toggleNavMenu = () => {
    setShowNavMenu(!showNavMenu);
  };

  const closeNavMenu = () => {
    setShowNavMenu(false);
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);

      // FormData 객체를 생성하여 이미지 파일과 다른 폼 데이터를 함께 전송
      const formData = new FormData();
      formData.append('name', editedProduct.name);
      formData.append('description', editedProduct.description);
      formData.append('price', editedProduct.price);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch(`${serverHost}:8800/productsmanage/${editedProduct.id}`, {
        method: 'PUT',
        headers: {
          'user_id': sessionStorage.getItem('userId')
        },
        body: formData
      });

      if (response.ok) {
        setProduct(editedProduct);
        swal("성공", "상품이 성공적으로 업데이트되었습니다.", "success").then(() => {
          navigate('/ProductManagement');
        });
      } else {
        console.error('상품 업데이트 오류:', response.status);
        swal("오류", "상품 업데이트 중 오류가 발생했습니다.", "error");
      }
    } catch (error) {
      console.error('상품 업데이트 오류:', error);
      swal("오류", "상품 업데이트 중 오류가 발생했습니다.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "price") {
      if (/^\d*$/.test(value) && value.length <= 8) {
        setEditedProduct({ ...editedProduct, [name]: value });
      }
    } else if (name === "description") {
      if (value.length <= 1000) {
        setEditedProduct({ ...editedProduct, [name]: value });
        setDescriptionCharCount(value.length);
      }
    } else {
      setEditedProduct({ ...editedProduct, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(selectedFile);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
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
        onSearchSubmit={handleSearchProduct}
        recentSearches={[]}
      />

      <div className="add-container">
        <div className="image-upload">
          {/* Wrap the image with a label */}
          <label htmlFor="image" style={{ marginBottom: '10px' }}>
            {/* Display image preview */}
            <img
              className="product-m-image"
              src={imagePreview || `${serverHost}:8800/uploads/${editedProduct.image}`}
              alt={editedProduct.name}
            />
          </label>
          {/* Hidden input for file selection */}
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </div>
        <div className="form-group">
          <label htmlFor="name" style={{ marginTop: '30px' }}>상품명</label>
          <input type="text"
            name="name"
            placeholder="상품명을 입력해 주세요."
            value={editedProduct.name}
            onChange={handleInputChange} />
        </div>

        <div className="form-group">
          <label htmlFor="description" style={{ marginTop: '30px' }}>상품 설명</label>
          <textarea
            placeholder={"브랜드, 모델명, 구매시기, 하자 유무 등 상품 상품 설명을 최대한 자세히 적어주세요.\n전화번호, SNS 계정 등 개인정보 입력은 제한될 수 있습니다."}
            name="description"
            value={editedProduct.description}
            onChange={handleInputChange}
          />
          <p className="char-count">{descriptionCharCount} / 1000</p> {/* Character count display */}
        </div>
        <div className="form-group">
          <label htmlFor="price">가격</label>
          <div className="price-input">
            <input
              type="number"
              placeholder="가격을 입력해 주세요."
              name="price"
              value={editedProduct.price}
              onChange={handleInputChange}
            />
            <span>원</span>
          </div>
        </div>
        <button
          className="add-product-button"
          onClick={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : '수정'}
        </button>
      </div>
    </div>
  );
};

export default ProductManagementForm;