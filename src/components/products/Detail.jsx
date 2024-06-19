import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import '../../styles/product.css';
import serverHost from '../../utils/host';

function Detail({ filteredProducts }) {
  const navigate = useNavigate();
  const [formattedProducts, setFormattedProducts] = useState([]);

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

  return (
    <div className="product-list-container">
      <div className="product-list-wrapper">
        <div className="product-grid">
          {formattedProducts.map((product) => (
            <div
              key={product.id}
              className="product-item"
              onClick={(e) => handleProductClick(e, product.id)}>

              <div className="product-image-container">
                <img
                  src={`${serverHost}:8800/uploads/${product.image}`}
                  alt="Product"
                  className="product-image"
                />
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
          ))}
        </div>
      </div>
    </div>
  );
}

export default Detail;