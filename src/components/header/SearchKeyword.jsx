import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/searchkeyword.css';
import serverHost from '../../utils/host';
import Header from '../header/Header';

function SearchKeyword() {
  const [searchKeywords, setSearchKeywords] = useState([]);
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [, setSavedSearchTerm] = useState('');
  const [, setShowSearchResults] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [, setSearchError] = useState('');
  const [, setFilteredProducts] = useState([]);

  // Fetches the current logged-in user's ID from session storage
  const fetchUserId = useCallback(() => {
    const userId = sessionStorage.getItem('userId');
    setUserId(userId);
  }, []);

  // Fetches the search keywords for the current user from the server
  const fetchSearchKeywords = useCallback(async () => {
    try {
      const response = await fetch(`${serverHost}:8800/SearchKeywords/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSearchKeywords(data);
      } else {
        console.error('Failed to fetch search keywords.');
      }
    } catch (error) {
      console.error('Error fetching search keywords:', error);
    }
  }, [userId]);

  // Deletes a search keyword by its ID
  const deleteKeyword = async (keywordId) => {
    try {
      const response = await fetch(`${serverHost}:8800/SearchKeywords/delete/${keywordId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchSearchKeywords(); // Re-fetch the keywords after deletion
      } else {
        console.error('Failed to delete keyword.');
      }
    } catch (error) {
      console.error('Error deleting keyword:', error);
    }
  };

  const handleSearchProduct = async () => {
    if (!searchTerm) {
      setSearchError('Please enter a search term.');
      return;
    }
    try {
      const response = await fetch(`${serverHost}:8800/products?search=${searchTerm}`);
      if (response.ok) {
        const data = await response.json();
        setFilteredProducts(data);
        setSavedSearchTerm(searchTerm);
        saveSearchTerm(searchTerm);
        setShowSearchResults(true);
        setSearchError('');

        // Navigate to SearchResults page with encoded searchTerm
        navigate(`/SearchResultsP/${encodeURIComponent(searchTerm)}`);
      } else {
        console.error('Search error:', response.status);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const saveSearchTerm = async (searchTerm) => {
    try {
      const userId = sessionStorage.getItem('userId');
      const response = await fetch(`${serverHost}:8800/searchHistory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ searchTerm, userId })
      });
      if (!response.ok) {
        console.error('Failed to save search term:', response.status);
      }
    } catch (error) {
      console.error('Error saving search term:', error);
    }
  };

  const toggleNavMenu = () => {
    setShowNavMenu(!showNavMenu);
  };

  const closeNavMenu = () => {
    setShowNavMenu(false);
  };

  const handleAddProduct = () => {
    navigate('/AddProducts');
  };

  const handleShowChatList = () => {
    navigate('/ChatListComponent');
  };

  const handleKeywordManagement = () => {
    navigate('/SearchKeyword');
  };

  const handleShowWishlist = () => {
    navigate('/ShowWishlist');
  };

  const handleShowMyInfoPage = () => {
    navigate('/MyInfo');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userId');
    localStorage.removeItem('userId');
    navigate('/Login');
  };

  const handleProductManagement = () => {
    navigate('/ProductManagement');
  };

  const handleChangeSearchTerm = (event) => {
    setSearchTerm(event.target.value);
    setSearchError('');
  };

  const handleEnterKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchProduct();
    }
  };

  useEffect(() => {
    fetchUserId();
  }, [fetchUserId]);

  useEffect(() => {
    if (userId) {
      fetchSearchKeywords();
    }
  }, [userId, fetchSearchKeywords]);

  return (
    <div className="container-main">
      <Header
        toggleNavMenu={toggleNavMenu}
        showNavMenu={showNavMenu}
        closeNavMenu={closeNavMenu}
        handleAddProduct={handleAddProduct}
        handleShowChatList={handleShowChatList}
        handleShowMyInfoPage={handleShowMyInfoPage}
        handleKeywordManagement={handleKeywordManagement}
        handleProductManagement={handleProductManagement}
        handleLogout={handleLogout}
        searchTerm={searchTerm}
        handleChangeSearchTerm={handleChangeSearchTerm}
        handleEnterKeyPress={handleEnterKeyPress}
        searchInputRef={searchInputRef}
        handleShowWishlist={handleShowWishlist}
      />

      <h1 className="search-keyword-header">Search History</h1>
      <div className="search-keyword-container">
        {searchKeywords.map((keyword) => (
          <li key={keyword.id} className="keyword-item">
            <span className="keyword-text">{keyword.search_term}</span>
            <button className="delete-button" onClick={() => deleteKeyword(keyword.id)}>Delete</button>
          </li>
        ))}
      </div>
    </div>
  );
}

export default SearchKeyword;
