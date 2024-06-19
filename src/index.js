import React from 'react';
import ReactDOM from 'react-dom/client'; // 수정 필요
import './index.css';
import App from './utils/App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();