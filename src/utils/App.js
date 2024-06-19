import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import RejectUserEdit from '../components/auth/RejectUserEdit'
import FindId from '../components/profile/FindId';
import FindPw from '../components/profile/FindPw';
import Main from '../components/auth/Main';
import AdminPage from '../components/auth/AdminPage';
import SearchKeyword from '../components/header/SearchKeyword';
import SearchResults from '../components/header/SearchResults';
import AddProducts from '../components/products/AddProductsPage';
import ProductDetail from '../components/products/ProductDetail';
import ProductList from '../components/products/ProductList';
import LatestList from '../components/products/LatestList';
import DetailList from '../components/products/DetailList';
import Detail from '../components/products/Detail';

import ProductManagement from '../components/products/ProductManagement';
import ProductManagementForm from '../components/products/ProductManagementForm';
import MyInfo from '../components/profile/MyInfo';
import ChangePw from '../components/products/ChangePw';
import ChatListComponent from '../components/messages/ChatListComponent';
import ChatModal from '../components/messages/ChatModal';
import { CheckoutPage } from '../components/products/Checkout';
import { SuccessPage } from '../components/products/Success';
import { FailPage } from '../components/products/Fail';
import ShowWishlist from '../components/products/ShowWishlist'; // showWishlist 컴포넌트 파일 import
import Payments from '../components/products/Payments';
import Report from '../components/products/Report';
import ReportList from '../components/products/ReportList';
import '../styles/main.css';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const isAdmin = sessionStorage.getItem('isAdmin');
  return isAdmin === 'true' ? children : <Navigate to="/Login" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/RejectUserEdit/:userId" element={<RejectUserEdit />} />
          <Route path="/Main" element={<Main />} />
          <Route path="/AdminPage" element={
            <PrivateRoute>
              <AdminPage />
            </PrivateRoute>
          } />

          <Route path="/Signup" element={<Signup />} />
          <Route path="/FindId" element={<FindId />} />
          <Route path="/FindPw" element={<FindPw />} />

          <Route path="/SearchKeyword" element={<SearchKeyword />} />
          <Route path="/searchResultsP/:searchTerm/*" element={<SearchResults />} />
          <Route path="/AddProducts" element={<AddProducts />} />
          <Route path="/ProductDetail/:productId" element={<ProductDetail />} />
          <Route path="/ProductManagement" element={<ProductManagement />} />
          <Route path="/ProductManagementForm/:productId" element={<ProductManagementForm />} />
          <Route path="/ProductList" element={<ProductList />} />
          <Route path="/LatestList" element={<LatestList />} />
          <Route path="/DetailList" element={<DetailList />} />
          <Route path="/Detail" element={<Detail />} />
          <Route path="/MyInfo" element={<MyInfo />} />
          <Route path="/ChangePw" element={<ChangePw />} />
          <Route path="/ChatListComponent" element={<ChatListComponent />} />
          {/* 다른 페이지 라우팅을 추가할 수 있습니다 */}
          <Route exact path="/chat/:roomId" component={ChatModal} />
          <Route path="/ShowWishlist" element={<ShowWishlist />} />
          <Route path="/sandbox" element={<CheckoutPage />} />
          <Route path="/sandbox/success" element={<SuccessPage />} />
          <Route path="/sandbox/fail" element={<FailPage />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/Report/:productId" element={<Report />} />
          <Route path="/ReportList" element={<ReportList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;