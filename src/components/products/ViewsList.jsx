import React, { useState, useEffect } from 'react';
import ProductList from './ProductList';
import serverHost from '../../utils/host';

function ViewsList({ category }) {
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchViewsProducts = async () => {
      try {
        let url = `${serverHost}:8800/products/views`;
        if (category) {
          url += `?category=${category}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setFilteredProducts(data);
        } else {
          console.error('조회순 상품 목록 가져오기 오류:', response.status);
        }
      } catch (error) {
        console.error('조회순 상품 목록 가져오기 오류:', error);
      }
    };

    fetchViewsProducts();
  }, [category]);

  return (
    <div className='h2-font'>
      <h2 className='text-center article-list-title'>중고거래 인기 매물</h2>
      <ProductList filteredProducts={filteredProducts} />
    </div>
  );
}

export default ViewsList;
