import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import swal from 'sweetalert';
import serverHost from '../../utils/host';
import '../../styles/report.css';  // Assuming you have a CSS file for styling

const Report = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('userId');

  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [sellerId, setSellerId] = useState('');

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await fetch(`${serverHost}:8800/products/detail/${productId}`);
        const product = await response.json();
        setSellerId(product.user_id);
      } catch (error) {
        console.error('Error fetching product data:', error);
        swal("상품 정보를 불러오는 데 오류가 발생했습니다.", "", "error");
      }
    };

    fetchProductData();
  }, [productId]);

  const handleReasonChange = (e) => {
    setReason(e.target.value);
  };

  const handleDetailsChange = (e) => {
    setDetails(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason || (reason === 'other' && !details)) {
      swal("모든 필드를 입력해주세요", "", "error");
      return;
    }

    try {
      const response = await fetch(`${serverHost}:8800/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          userId,
          sellerId,
          reason,
          details: reason === 'other' ? details : ''
        })
      });

      if (response.ok) {
        swal("신고가 접수되었습니다.", "", "success");
        navigate(`/ProductDetail/${productId}`);
      } else {
        console.error('신고 접수 오류:', response.status);
        swal("신고 접수 실패", "다시 시도해주세요.", "error");
      }
    } catch (error) {
      console.error('신고 접수 오류:', error);
      swal("신고 접수 오류", "다시 시도해주세요.", "error");
    }
  };

  return (
    <div className="report-container">
      <h2>신고하기</h2>
      <form onSubmit={handleSubmit}>
        <div className="report-form-group">
          <label htmlFor="reason">신고 사유:</label>
          <select id="reason" value={reason} onChange={handleReasonChange} required>
            <option value="">선택해주세요</option>
            <option value="fraud">사기</option>
            <option value="misleading">허위 정보</option>
            <option value="abuse">악용</option>
            <option value="other">기타</option>
          </select>
        </div>
        {reason === 'other' && (
          <div className="report-form-group">
            <label htmlFor="details">상세 내용:</label>
            <textarea id="details" value={details} onChange={handleDetailsChange} required />
          </div>
        )}
        <button className="report-button" type="submit">신고하기</button>
      </form>
    </div>
  );
};

export default Report;
