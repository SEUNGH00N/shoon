// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

// 인증 여부를 확인하는 함수
const isAuthenticated = () => {
  // 예시: 사용자가 인증되었는지 확인하는 로직을 작성합니다.
  // 예를 들어, 세션 정보나 토큰을 확인하거나 사용자의 권한을 검사할 수 있습니다.
  // 여기서는 로컬 스토리지에서 isAdmin 값이 true인지 확인합니다.
  return sessionStorage.getItem('isAdmin') === 'true';
};

// 보호된 경로 컴포넌트
const ProtectedRoute = ({ element: Component, ...rest }) => {
  return isAuthenticated() ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
