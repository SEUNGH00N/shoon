import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // 검색 아이콘을 추가로 import합니다.
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import serverHost from './host';

import { useNavigation, useFocusEffect } from '@react-navigation/native';

function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchKeywords, setSearchKeywords] = useState([]);
  const [topSearchKeywords, setTopSearchKeywords] = useState([]); // 추가된 부분
  const [userId, setUserId] = useState('');
  const [, setSavedSearchTerm] = useState('');
  const navigation = useNavigation();
  const [hoveredItemId, setHoveredItemId] = useState(null); // Hover state for recent items
  const [hoveredKeywordIndex, setHoveredKeywordIndex] = useState(null); // Hover state for top keywords

  useFocusEffect(
    useCallback(() => {
      fetchSearchKeywords();
      fetchTopSearchKeywords(); // 최근 검색어와 함께 가장 많이 검색된 검색어도 가져오기
    }, [fetchSearchKeywords, fetchTopSearchKeywords]) // fetchTopSearchKeywords 추가
  );

  // 현재 로그인된 사용자의 ID를 가져오는 함수
  const fetchUserId = useCallback(async () => {
    const userId = await AsyncStorage.getItem('userId');
    setUserId(userId);
  }, []);

  const saveSearchTerm = async (searchTerm) => {
    try {
      const response = await fetch(`${serverHost}:4000/searchHistory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ searchTerm, userId })
      });
      if (!response.ok) {
        console.error('검색어 저장 오류:', response.status);
      } else {
        // 검색어 저장 후 최근 검색어 다시 불러오기
        fetchSearchKeywords();
      }
    } catch (error) {
      console.error('검색어 저장 오류:', error);
    }
  };

  // 검색어 목록을 서버로부터 가져오는 함수
  const fetchSearchKeywords = useCallback(async () => {
    try {
      const response = await fetch(`${serverHost}:4000/searchKeywords/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSearchKeywords(data);
      } else {

      }
    } catch (error) {
      console.error('검색어를 가져오는 중 오류가 발생했습니다:', error);
    }
  }, [userId]);

  // 가장 많이 검색된 검색어를 서버로부터 가져오는 함수
  const fetchTopSearchKeywords = useCallback(async () => {
    try {
      const response = await fetch(`${serverHost}:4000/topSearchKeywords`);
      if (response.ok) {
        const data = await response.json();
        setTopSearchKeywords(data);
      }
    } catch (error) {
      console.error('가장 많이 검색된 검색어를 가져오는 중 오류가 발생했습니다:', error);
    }
  }, []);

  // 검색 버튼 클릭 시 검색 결과를 가져오는 함수
  // 검색 버튼 클릭 시 검색 결과를 가져오는 함수
  const handleSearch = async (searchTerm) => {
    try {
      // 검색어가 비어 있는지 확인
      if (!searchTerm.trim()) {
        // console.error('검색어를 입력하세요.');
        return;
      }

      // 서버로 검색어를 포함한 GET 요청 보내기
      const response = await fetch(`${serverHost}:4000/products?search=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const searchResults = await response.json();
        // 검색 결과를 SearchResults 컴포넌트로 전달
        saveSearchTerm(searchTerm);
        setSavedSearchTerm(searchTerm);
        navigation.navigate('SearchResults', { searchResults, searchTerm });
        // console.log('검색 결과:', searchResults);
        // 검색어 저장
        setSearchTerm(''); // 검색 완료 후 검색어 초기화

      } else {
        // 검색 오류 처리
        console.error('검색 오류:', response.status);
      }
    } catch (error) {
      // 검색 오류 처리
      console.error('검색 오류:', error);
    }
  };
  // 검색어 삭제 함수
  const deleteKeyword = async (keywordId) => {
    try {
      const response = await fetch(`${serverHost}:4000/searchKeywords/delete/${keywordId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchSearchKeywords(); // 삭제 후 목록을 다시 가져옴
      } else {
        console.error('검색어 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('검색어를 삭제하는 중 오류가 발생했습니다:', error);
    }
  };

  // 컴포넌트가 마운트되면 사용자 ID와 검색어 목록을 가져옴
  useEffect(() => {
    fetchUserId();
  }, [fetchUserId]);

  useEffect(() => {
    if (userId !== '') {
      fetchSearchKeywords();
      fetchTopSearchKeywords(); // 최근 검색어와 함께 가장 많이 검색된 검색어도 가져오기
    }
  }, [userId, fetchSearchKeywords, fetchTopSearchKeywords]);

  // 검색어를 누르면 해당 검색어로 검색되도록 하는 함수
  const searchWithKeyword = async (keyword) => {
    setSearchTerm(keyword);
    handleSearch(keyword); // 검색어를 검색 함수에 전달하여 검색을 수행
  };


  return (
    <View style={styles.container}>
      {/* 검색 바 */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="검색어를 입력하세요"
        />
        <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch(searchTerm)}>
          <Ionicons name="search" size={24} color="#103260" />
        </TouchableOpacity>
      </View>

      {/* 가장 많이 검색된 검색어 */}
      <View style={styles.topKeywordsContainer}>
        <Text style={styles.sectionTitle}>가장 많이 검색된 검색어</Text>
        <ScrollView
          horizontal
          style={styles.topKeywords}
          showsHorizontalScrollIndicator={false} // 스크롤바 숨기기
        >
          {topSearchKeywords.map((keyword, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.keywordItem,
                { backgroundColor: hoveredKeywordIndex === index ? '#d3d3d3' : '#f0f0f0' }
              ]}
              onPress={() => searchWithKeyword(keyword.search_term)}
              onPressIn={() => setHoveredKeywordIndex(index)}
              onPressOut={() => setHoveredKeywordIndex(null)}
            >
              <Text style={styles.keywordText}>{keyword.search_term}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 최근 검색어 */}
      <View style={styles.recentContainer}>
        <Text style={styles.sectionTitle}>최근 검색어</Text>
        <ScrollView
          style={styles.recentSearches}
          showsVerticalScrollIndicator={false} // 스크롤바 숨기기
        >
          {searchKeywords.map((keyword) => (
            <TouchableOpacity
              key={keyword.id}
              style={[
                styles.recentItem,
                { backgroundColor: hoveredItemId === keyword.id ? '#d3d3d3' : '#f0f0f0' }
              ]}
              onPress={() => searchWithKeyword(keyword.search_term)}
              onPressIn={() => setHoveredItemId(keyword.id)}
              onPressOut={() => setHoveredItemId(null)}
            >
              <MaterialIcons name="history" size={18} color="black" style={styles.historyIcon} />
              <Text style={styles.recentText}>{keyword.search_term}</Text>
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteKeyword(keyword.id)}>
                <Ionicons name="close-sharp" size={20} color="#103260" />
              </TouchableOpacity>


            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 30
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center', // 세로 정렬
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10, // 검색창과 버튼 사이 여백 추가
  },
  searchButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18, // 제목 크기 증가
    fontWeight: 'bold',
    marginBottom: 20, // 섹션 간격 증가
  },
  topKeywordsContainer: {
    marginBottom: 20, // 섹션 간격 증가
  },
  topKeywords: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  keywordItem: {
    marginRight: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  keywordText: {
    fontSize: 14,
  },
  recentContainer: {
    marginBottom: 20,
  },
  recentSearches: {
    width: '100%', // 최근 검색어 목록 전체 너비 사용
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  historyIcon: {
    marginRight: 10,
  },

  recentText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333', // 텍스트 색상 변경
  },

  deleteButton: {
    marginLeft: 10,
  },

});

export default SearchPage;