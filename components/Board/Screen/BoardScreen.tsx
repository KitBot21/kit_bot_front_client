import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Keyboard,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/App";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import RenderPost from "./RenderPost";
import { usePosts } from "@/components/api/hooks/postQuery";

export default function BoardScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [showSearch, setShowSearch] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [inputValue, setInputValue] = useState("");
  const searchInputRef = useRef<TextInput>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = usePosts(searchKeyword);

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  const handleSearchPress = () => {
    const newShowSearch = !showSearch;
    setShowSearch(newShowSearch);

    if (newShowSearch) {
      // 검색창 열 때 포커스
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      // 검색창 닫을 때 초기화
      setInputValue("");
      setSearchKeyword("");
      Keyboard.dismiss();
    }
  };

  const handleSearch = () => {
    setSearchKeyword(inputValue.trim());
    Keyboard.dismiss(); // ✅ 키보드 닫기
    searchInputRef.current?.blur(); // ✅ 포커스 해제
  };

  const handleClearSearch = () => {
    setInputValue("");
    setSearchKeyword("");
    searchInputRef.current?.focus(); // 초기화 후 다시 포커스
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>게시글을 불러오는 중...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>게시글을 불러오는데 실패했습니다.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 (검색창 통합) */}
      <View style={styles.header}>
        {!showSearch ? (
          <>
            <Text style={styles.headerTitle}>게시판</Text>
            <TouchableOpacity onPress={handleSearchPress}>
              <Ionicons name="search-outline" size={24} color="#333" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.searchInputWrapper}>
              <Ionicons
                name="search"
                size={20}
                color="#8E8E93"
                style={styles.searchIcon}
              />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="게시글 검색..."
                placeholderTextColor="#999"
                value={inputValue}
                onChangeText={setInputValue}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {inputValue.length > 0 && (
                <TouchableOpacity
                  onPress={handleClearSearch}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color="#8E8E93" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              onPress={handleSearchPress}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* 검색 결과 헤더 */}
      {searchKeyword && (
        <View style={styles.searchResultHeader}>
          <Ionicons name="search" size={16} color="#666" />
          <Text style={styles.searchResultText}>
            '{searchKeyword}' 검색 결과 ({posts.length}개)
          </Text>
        </View>
      )}

      {/* 게시글 목록 */}
      <FlatList
        data={posts}
        renderItem={({ item }) => <RenderPost item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>
              {searchKeyword ? "검색 결과가 없습니다" : "게시글이 없습니다."}
            </Text>
            {searchKeyword && (
              <Text style={styles.emptySubText}>
                다른 검색어로 시도해보세요
              </Text>
            )}
          </View>
        }
        refreshing={false}
        onRefresh={() => refetch()}
      />

      {/* 글쓰기 버튼 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("QuestionWrite")}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: "#333",
  },
  clearButton: {
    padding: 4,
  },
  closeButton: {
    padding: 0,
  },
  searchResultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#F9F9F9",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  searchResultText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8E8E93",
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8E8E93",
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 12,
    color: "#C7C7CC",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
