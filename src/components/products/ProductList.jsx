import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import '../../styles/product.css';
import serverHost from '../../utils/host';

function ProductList({ filteredProducts }) {
  const navigate = useNavigate();
  const [formattedProducts, setFormattedProducts] = useState([]);

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
    <div className="cards-wrap">
      {formattedProducts.map((product) => (
        <article className={`card-top ${product.status === '판매완료' ? 'sold-out' : ''}`} key={product.id} onClick={(e) => handleProductClick(e, product.id)}>
          <div className="card-link" data-event-label={product.id}>
            <div className="card-photo">
              <img
                src={`${serverHost}:8800/uploads/${product.image}`}
                alt={product.title}
              />
              {product.status && (
                <div className={`sale-status-label ${product.status === '판매완료' ? 'sold-out-label' : ''}`}>
                  {product.status === '판매완료' ? '판매 완료' : '구매 가능'}
                </div>
              )}
            </div>
            <div className="card-desc">
              <h2 className="card-title">{product.name}</h2>
              <div className="card-price">{product.price}원</div>
              <div className="card-info">
                <div className="card-views">
                  <VisibilityIcon style={{ marginRight: '5px' }} />
                  {product.views}
                </div>
                <p className="card-time">{product.formattedCreatedAt}</p>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default ProductList;