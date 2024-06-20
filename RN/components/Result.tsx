import type { PaymentType } from '../node_modules/@tosspayments/widget-sdk-react-native/src/models/PaymentType';

export interface Result {
  success?: Success;
  fail?: Fail;
}

export interface Success {
  /** 결제를 식별하는 키 값입니다. 토스페이먼츠에서 발급합니다. 결제 승인, 결제 조회, 결제 취소 등 운영에 필요한 값입니다. */
  paymentKey: string;

  /** 주문 ID입니다. 결제 요청에 보낸 값입니다. */
  orderId: string;

  /** 결제 금액입니다. 결제 요청에 보낸 결제 금액과 같은지 반드시 확인해보세요. 클라이언트에서 결제 금액을 조작해 승인하는 행위를 방지할 수 있습니다. 만약 값이 다르다면 결제를 취소하고 구매자에게 알려주세요. 적립금이나 쿠폰이 적용된 금액이 맞는지도 확인해보세요. */
  amount: number;

  /** 결제 유형입니다. NORMAL, BRANDPAY, KEYIN 중 하나입니다.
    NORMAL: 일반 결제입니다. 코어 결제 승인 API를 호출해서 결제를 완료하세요.
    BRANDPAY: 브랜드페이 결제입니다. 브랜드페이 시크릿 키로 브랜드페이 결제 승인 API를 호출해서 결제를 완료하세요.
    KEYIN: 키인 결제입니다. 키인 결제 시크릿 키로 코어 결제 승인 API를 호출해서 결제를 완료하세요.
    */
  paymentType: PaymentType;

  /** 브랜드페이를 추가하는 Pro 플랜 기능을 사용하고 있다면 필요한 파라미터입니다. */
  additionalParameters?: Record<string, string>;
}

export interface Fail {
  /** 에러 코드입니다. 에러 목록을 확인하세요. */
  code: string;
  /** 에러 메시지입니다. */
  message: string;
  /** 주문 ID입니다. 결제 요청에 담아 보낸 값입니다. */
  orderId?: string;
}

// Define the type for the navigation parameters
export interface NavigationParams {
  paymentData: Success;
  product: any;
  price: number;
  userId: string | null;
}
