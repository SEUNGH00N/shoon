/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Modal from "react-modal";
import serverHost from "../../utils/host";
import swal from "sweetalert";

export function SuccessPage() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림 상태
  const [ratingSubmitted, setRatingSubmitted] = useState(false); // 평점 제출 상태

  const [searchParams] = useSearchParams();
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const userId = sessionStorage.getItem('userId'); // 사용자 ID 가져오기
  const productId = sessionStorage.getItem('productId'); // 사용자 ID 가져오기
  const [rating, setRating] = useState(0);

  async function confirmPayment() {
    try {
      const response = await fetch(`${serverHost}:8800/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
          productId,
          userId // 사용자 ID 전달
        })
      });

      if (response.ok) {
        setIsConfirmed(true);
        // 결제 완료 후 상품의 판매 상태를 업데이트
        await handleSellProduct(productId);
        // Open the modal after successful payment
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
    }
  }

  // Function to navigate back to the main page
  function navigateToMainPage() {
    window.location.href = "/Main"; // Replace "/" with the URL of your main page
  }

  // 상품의 판매 상태를 업데이트하는 함수
  const handleSellProduct = async (productId) => {
    try {
      const response = await fetch(`${serverHost}:8800/productsmanage/sold/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user_id': sessionStorage.getItem('userId')
        }
      });
      if (response.ok) {
        // 알림 표시
        swal("성공", "상품이 판매되었습니다.", "success");
      } else {
        console.error('상품 판매완료 처리 실패:', response.status);
        swal("오류", "상품 판매완료 처리에 실패했습니다.", "error");
      }
    } catch (error) {
      console.error('상품 판매완료 처리 실패:', error);
      swal("오류", "상품 판매완료 처리 중 오류가 발생했습니다.", "error");
    }
  };


  // Function to update the seller rating
  const updateSellerRating = async () => {
    try {

      // 판매자 평점을 서버로 전송
      const response = await fetch(`${serverHost}:8800/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({

          productId,
          rating: rating // 현재 선택된 평점을 전송합니다.
        })
      });

      if (response.ok) {
        // 평점 업데이트 성공 시
        console.log('Seller rating updated successfully.');
        // 평점 제출 상태 업데이트
        setRatingSubmitted(true);
        swal("성공", "평점 등록 성공", "success");
      } else {
        // 평점 업데이트 실패 시
        console.error('Failed to update seller rating:', response.status);
        swal("오류", "평점 등록에 실패했습니다.", "error");
      }
    } catch (error) {
      // 오류 처리
      console.error('Error updating seller rating:', error);
      swal("오류", "평점 등록 중 오류가 발생했습니다.", "error");
    }
  };

  // Function to handle seller rating
  const handleRatingChange = (value) => {
    // Round to one decimal place
    const roundedValue = Math.round(value * 10) / 10;
    setRating(roundedValue);
  };



  // Function to handle modal close
  const closeModal = () => {
    setIsModalOpen(false);
    // If rating is submitted, reset the ratingSubmitted state
    if (ratingSubmitted) {
      setRatingSubmitted(false);
    }
  };

  return (
    <div className="wrapper w-100">
      {isConfirmed ? (
        <div
          className="flex-column align-center confirm-success w-100 max-w-540"
          style={{
            display: "flex"
          }}
        >
          <img
            src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"
            width="120"
            height="120"
          />
          <h2 className="title">결제를 완료했어요</h2>
          <div className="response-section w-100">
            <div className="flex justify-between">
              <span className="response-label">결제 금액</span>
              <span id="amount" className="response-text">
                {amount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="response-label">주문번호</span>
              <span id="orderId" className="response-text">
                {orderId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="response-label">paymentKey</span>
              <span id="paymentKey" className="response-text">
                {paymentKey}
              </span>
            </div>
          </div>
          <div className="w-100 button-group">
            <a className="btn primary" href="/my/payment-logs" target="_blank" rel="noreferrer noopener">테스트 결제내역 확인하기</a>
            <div className="flex" style={{ gap: "16px" }}>
              <a
                className="btn w-100"
                href="https://developers.tosspayments.com/sandbox"
              >
                다시 테스트하기
              </a>
              <a
                className="btn w-100"
                href="https://docs.tosspayments.com/guides/payment-widget/integration"
                target="_blank"
                rel="noopner noreferer noreferrer"
              >
                결제 연동 문서가기
              </a>
            </div>
            <a className="btn" onClick={navigateToMainPage}>메인으로 이동</a>
          </div>
        </div>
      ) : (
        <div className="flex-column align-center confirm-loading w-100 max-w-540">
          <div className="flex-column align-center">
            <img
              src="https://static.toss.im/lotties/loading-spot-apng.png"
              width="120"
              height="120"
            />
            <h2 className="title text-center">결제 요청까지 성공했어요.</h2>
            <h4 className="text-center description">결제 승인하고 완료해보세요.</h4>
          </div>
          <div className="w-100">
            <button className="btn primary w-100" onClick={confirmPayment}>
              결제 승인하기
            </button>
          </div>
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="rate-ReactModal__Content"
        overlayClassName="rate-ReactModal__Overlay"
      >
        {ratingSubmitted ? (
          <div className="rate-modal-content">
            <h2 className="rate-h2">평점이 제출되었습니다!</h2>
            <button className="rate-button" onClick={closeModal}>닫기</button>
          </div>
        ) : (
          <div className="rate-modal-content">
            <h2 className="rate-h2">사용자 평점 등록</h2>
            <div className="rate-rating-section">
              <input
                type="range"
                min="0"
                max="4.5"
                step="0.1"
                value={rating}
                onChange={(e) => handleRatingChange(e.target.value)}
                className="rate-input-range"
              />
              <span className="rate-rating-value">{rating.toFixed(1)}</span>
            </div>
            <button className="rate-button" onClick={updateSellerRating}>평점 등록</button>
            <button className="rate-button" onClick={closeModal}>닫기</button>
          </div>
        )}
      </Modal>

    </div>
  );
}