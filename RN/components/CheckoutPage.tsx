import React, { useState, useEffect } from 'react';
import { Button, Alert, TouchableOpacity, Text, View, ScrollView, StyleSheet } from 'react-native';
import { PaymentWidgetProvider, usePaymentWidget, AgreementWidget, PaymentMethodWidget } from '@tosspayments/widget-sdk-react-native';
import type { AgreementWidgetControl, PaymentMethodWidgetControl, AgreementStatus } from '@tosspayments/widget-sdk-react-native';
import uuid from 'react-native-uuid';  // Import the react-native-uuid package
import serverHost from './host';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NavigationParams, Result } from './Result';

export default function App() {
  return (
    <PaymentWidgetProvider clientKey={`test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm`} customerKey={`EaOs-jWLYku63ZJ3qr619`}>
      <CheckoutPage />
    </PaymentWidgetProvider>
  );
}

function CheckoutPage() {
  const paymentWidgetControl = usePaymentWidget();
  const [paymentMethodWidgetControl, setPaymentMethodWidgetControl] = useState<PaymentMethodWidgetControl | null>(null);
  const [agreementWidgetControl, setAgreementWidgetControl] = useState<AgreementWidgetControl | null>(null);
  const [price, setPrice] = useState<number | null>(null); // 가격은 숫자 타입으로 설정
  const [product, setProduct] = useState<any>(null); // 상품은 어떤 타입도 가능
  const [userId, setUserId] = useState<string | null>(null); // 사용자 ID는 문자열 타입으로 설정
  const [productId, setProductId] = useState<string | null>(null); // 상품 ID도 문자열 타입으로 설정

  const navigation = useNavigation();
  useEffect(() => {
    // fetchProductAndUser 함수 정의
    const fetchProductAndUser = async () => {
      try {
        // 사용자 ID와 상품 ID 가져오기
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedProductId = await AsyncStorage.getItem('productId');
        setUserId(storedUserId);
        setProductId(storedProductId);

        // 상품 정보 가져오기
        if (storedProductId) {
          const response = await fetch(`${serverHost}:4000/products/detail/${storedProductId}`);
          if (response.ok) {
            const productData = await response.json();
            // 서버에서 받은 가격 정보를 숫자로 변환하여 상태에 설정
            const parsedPrice = parseFloat(productData.price);
            setProduct(productData);
            setPrice(parsedPrice);

            if (productData.status === "판매완료") {
              // 상품이 판매완료된 경우 알람 표시 및 메인 페이지로 이동
              Alert.alert('판매완료된 상품입니다.');
              navigation.navigate('Main');
            } else if (storedUserId && productData.user_id === storedUserId) {
              // 상품이 현재 로그인한 사용자의 것일 경우 결제를 막음
              Alert.alert('본인의 상품은 결제할 수 없습니다.');
              navigation.navigate('Main');
            }
          } else {
            console.error('Failed to fetch product detail');
          }
        }
      } catch (error) {
        console.error('Error fetching product and user:', error);
      }
    };

    // fetchProductAndUser 함수 호출
    fetchProductAndUser();
  }, []);


  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false} // 스크롤바 숨기기
      >
        <PaymentMethodWidget
          selector="payment-methods"
          onLoadEnd={() => {
            if (price !== null) {

              paymentWidgetControl
                .renderPaymentMethods(
                  'payment-methods',
                  { value: price }, // 숫자 형태의 가격을 전달
                  {
                    variantKey: 'DEFAULT',
                  }
                )
                .then(control => {
                  setPaymentMethodWidgetControl(control)
                })
            }
          }}
        />

        <AgreementWidget
          selector="agreement"
          onLoadEnd={() => {
            paymentWidgetControl.renderAgreement('agreement', {
              variantKey: 'DEFAULT',
            }).then(control => {
              setAgreementWidgetControl(control);
            });
          }}
        />
        <TouchableOpacity style={styles.button} onPress={async () => {
          if (paymentWidgetControl == null || agreementWidgetControl == null) {
            Alert.alert('주문 정보가 초기화되지 않았습니다.');
            return;
          }

          const agreement = await agreementWidgetControl.getAgreementStatus();
          if (agreement.agreedRequiredTerms !== true) {
            Alert.alert('약관에 동의하지 않았습니다.');
            return;
          }

          if (!paymentWidgetControl) {
            console.error('Payment widget is not available.');
            return;
          }

          if (!product) {
            console.error('Product is not available:', product);
            return;
          }

          if (!price) {
            console.error('Price is not available:', price);
            return;
          }

          try {
            const orderId = uuid.v4();
            const { name } = product;
            const paymentData = {
              orderId,
              orderName: name,
              customerName: '김토스',
              userId: userId, // 유저 ID 전달
              customerEmail: 'customer123@gmail.com',
              customerMobilePhone: '01012341234',
              amount: price, // 숫자 형태의 가격을 전달
              productId: productId, // 상품 ID 전달
            };

            // console.log('Sending payment request with the following data:', paymentData);

            await paymentWidgetControl.requestPayment(paymentData).then((result: Result) => {
              if (result?.success) {
                // 결제 성공 시 SuccessPage로 이동
                const navigationParams: NavigationParams = {
                  paymentData: result.success,
                  product,
                  price,
                  userId,
                };
                navigation.navigate('SuccessPage', navigationParams);
                // console.log('Payment success:', result.success);


              } else if (result?.fail) {
                // 결제 실패 비즈니스 로직을 구현하세요.
                console.log('Payment failed:', result.fail);
              }
            });

            console.log('Payment request completed.');
          } catch (error) {
            console.error('Error requesting payment:', error);
          }
        }}>

          <Text style={styles.buttonText}>결제요청</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#F4F4F4',
    overflow: 'hidden',
  },
  button: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
