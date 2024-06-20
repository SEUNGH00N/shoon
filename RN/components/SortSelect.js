import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

function SortSelect({ sortType, handleSortChange }) {
  return (
    <View style={styles.sortContainer}>
      {/* 정렬 기준을 선택하는 드롭다운 메뉴 */}
      <Text>정렬 기준:</Text>
      {/* 드롭다운 메뉴에서 선택한 값이 변경될 때 handleSortChange 함수 호출 */}
      <Picker
        selectedValue={sortType}
        onValueChange={(itemValue) => handleSortChange(itemValue)}
      >
        {/* 추천순과 최신순 옵션 제공 */}
        <Picker.Item label="추천순" value="recommend" />
        <Picker.Item label="최신순" value="latest" />
        <Picker.Item label="조회수순" value="views" />
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  sortContainer: {
    // 스타일링을 위한 스타일 시트
  },
});

export default SortSelect;
