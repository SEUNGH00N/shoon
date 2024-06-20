import React from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

function SearchInput({ searchTerm, handleChangeSearchTerm, handleSearchProduct }) {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <TextInput
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChangeText={handleChangeSearchTerm}
          style={styles.searchInput}
        />
      </View>
      <Button title="검색" onPress={handleSearchProduct} />
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    // 컨테이너 스타일링
  },
  searchInputContainer: {
    // 검색 입력 필드 컨테이너 스타일링
  },
  searchInput: {
    // 검색 입력 필드 스타일링
  },
});

export default SearchInput;