import React, { useEffect, useRef, useState } from "react";
import { loadPaymentWidget } from "@tosspayments/payment-widget-sdk";
import { nanoid } from "nanoid";
import serverHost from "../../utils/host";
import swal from "sweetalert";
// 구매자의 고유 아이디를 불러와서 customerKey로 설정하세요.
// 이메일・전화번호와 같이 유추가 가능한 값은 안전하지 않습니다.
const widgetClientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey = "M3i7lAuND4mg2KicZocer";
// const paymentWidget = PaymentWidget(widgetClientKey, PaymentWidget.ANONYMOUS) // 비회원 결제

export function CheckoutPage() {
  const [paymentWidget, setPaymentWidget] = useState(null);
  const paymentMethodsWidgetRef = useRef(null);
  const [price, setPrice] = useState(null); // 초기에는 가격 정보를 받기 전에는 null로 설정
  const [product, setProduct] = useState(null);
  const [userId, setUserId] = useState(null);
  const [productId, setProductId] = useState(null);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem('userId');
    const storedProductId = sessionStorage.getItem('productId');
    setUserId(storedUserId);
    setProductId(storedProductId);

    const fetchProductAndUser = async () => {
      // 상품 정보 가져오기
      if (storedProductId) {
        try {
          const response = await fetch(`${serverHost}:8800/products/detail/${storedProductId}`);
          if (response.ok) {
            const productData = await response.json();
            // 서버에서 받은 가격 정보를 숫자로 변환하여 상태에 설정
            const parsedPrice = parseFloat(productData.price);
            setProduct(productData);
            setPrice(parsedPrice);

            if (productData.status === "판매완료") {
              // 상품이 판매완료된 경우 알람 표시 및 메인 페이지로 이동
              swal("알림", "판매완료된 상품입니다.", "info").then(() => {
                navigateToMainPage("/Main"); // 메인 페이지로 이동
              });

            } else if (storedUserId && productData.user_id === storedUserId) {
              // 상품이 현재 로그인한 사용자의 것일 경우 결제를 막음
              swal("알림", "본인의 상품은 결제할 수 없습니다.", "info").then(() => {
                navigateToMainPage("/Main"); // 메인 페이지로 이동
              });

            }

          } else {
            console.error('Failed to fetch product detail');
          }
        } catch (error) {
          console.error('Error fetching product detail:', error);
        }
      }
    };

    fetchProductAndUser();
  }, []);

  useEffect(() => {
    const fetchPaymentWidget = async () => {
      try {
        const loadedWidget = await loadPaymentWidget(widgetClientKey, customerKey);
        setPaymentWidget(loadedWidget);
      } catch (error) {
        console.error("Error fetching payment widget:", error);
      }
    };

    fetchPaymentWidget();
  }, []);

  useEffect(() => {
    if (paymentWidget == null) {
      return;
    }

    const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
      "#payment-widget",
      { value: price },
      { variantKey: "DEFAULT" }
    );

    paymentWidget.renderAgreement(
      "#agreement",
      { variantKey: "AGREEMENT" }
    );

    paymentMethodsWidgetRef.current = paymentMethodsWidget;
  }, [paymentWidget, price]);

  useEffect(() => {
    const paymentMethodsWidget = paymentMethodsWidgetRef.current;

    if (paymentMethodsWidget == null) {
      return;
    }

    paymentMethodsWidget.updateAmount(price);
  }, [price]);

  const handlePaymentRequest = async () => {
    if (!paymentWidget || !product) {
      console.error('Payment widget or product not available.');
      return;
    }

    try {
      const orderId = nanoid();
      const { name } = product;
      await paymentWidget.requestPayment({
        orderId,
        orderName: name,
        customerName: '김토스',
        userId: userId, // 유저 ID 전달
        customerEmail: 'customer123@gmail.com',
        customerMobilePhone: '01012341234',
        amount: price, // 숫자 형태의 가격을 전달
        successUrl: `${window.location.origin}/sandbox/success`,
        failUrl: `${window.location.origin}/sandbox/fail`,
        productId: productId, // 상품 ID 전달

      });
    } catch (error) {
      console.error('Error requesting payment:', error);
    }
  };

  const navigateToMainPage = () => {
    window.location.href = "/Main";
  };

  return (
    <div>
      {/* 결제 UI, 이용약관 UI 영역 */}
      <div id="payment-widget" />
      <div id="agreement" />
      {/* 결제하기 버튼 */}
      <button
        className="btn w-100"
        onClick={handlePaymentRequest}>결제하기</button>
    </div>
  );
}
