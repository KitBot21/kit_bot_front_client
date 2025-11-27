import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/components/contexts/AuthContext";
import { useMyPosts } from "@/components/hooks/postQuery";
import { Post } from "@/components/api/types/APITypes/postTypes";
import { useGoogleAuth } from "@/components/hooks/useGoogleAuth";

export default function MyPageScreen() {
  const { user, updateUser } = useAuth();
  const { signOut } = useGoogleAuth();
  // --- React Query Hook 사용 ---
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useMyPosts();

  // 모든 페이지의 데이터를 하나의 배열로 합침
  const myPosts = data?.pages.flatMap((page) => page.content) ?? [];

  // --- 기존 상태 관리 (닉네임, 키워드) ---
  const [isEditing, setIsEditing] = useState(false);
  const [newNickname, setNewNickname] = useState(user?.username || "");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>(["React Native", "취업"]);

  // --- 핸들러 함수들 (기존 유지) ---
  const handleSaveNickname = async () => {
    if (!newNickname.trim()) return;
    try {
      if (user) {
        await updateUser({ ...user, username: newNickname });
        setIsEditing(false);
        Alert.alert("성공", "닉네임이 변경되었습니다.");
      }
    } catch (error) {
      Alert.alert("오류", "실패했습니다.");
    }
  };

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (!trimmed) return;
    if (keywords.includes(trimmed)) {
      Alert.alert("알림", "이미 등록된 키워드입니다.");
      return;
    }
    setKeywords([...keywords, trimmed]);
    setKeywordInput("");
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "로그아웃", style: "destructive", onPress: signOut },
    ]);
  };

  // --- 게시글 렌더링 컴포넌트 ---
  const renderPostItem = ({ item }: { item: Post }) => (
    <TouchableOpacity style={styles.postCard}>
      <View style={styles.titleRow}>
        <Text style={styles.postTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.postTime}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.postContent} numberOfLines={2}>
        {item.content}
      </Text>
      <View style={styles.postFooter}>
        <View style={styles.postStats}>
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={14} color="#8E8E93" />
            <Text style={styles.statText}>{item.recommendCount}</Text>
          </View>
          <View style={[styles.statItem, { marginLeft: 12 }]}>
            <Ionicons name="chatbubble-outline" size={14} color="#8E8E93" />
            <Text style={styles.statText}>{item.commentCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // --- ListHeaderComponent (기존 프로필 + 키워드 + 메뉴 영역) ---
  const renderHeader = () => (
    <View>
      {/* 1. 프로필 섹션 */}
      <View style={styles.profileSection}>
        <Ionicons name="person-circle-outline" size={80} color="#007AFF" />
        <Text style={styles.emailText}>{user?.email || "user@email.com"}</Text>
        <View style={styles.nicknameContainer}>
          {isEditing ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.nicknameInput}
                value={newNickname}
                onChangeText={setNewNickname}
                autoFocus
                maxLength={10}
              />
              <TouchableOpacity
                onPress={handleSaveNickname}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsEditing(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.displayRow}>
              <Text style={styles.nicknameText}>
                {user?.username || "닉네임 없음"}
              </Text>
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={styles.editIcon}
              >
                <Ionicons name="pencil" size={16} color="#8E8E93" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* 2. 키워드 구독 섹션 */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="notifications-outline" size={20} color="#333" />
          <Text style={styles.sectionTitle}>관심 키워드 구독</Text>
        </View>
        <Text style={styles.sectionDesc}>
          등록한 키워드가 포함된 글이 올라오면 알림을 받을 수 있어요.
        </Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.keywordInput}
            placeholder="키워드 입력"
            value={keywordInput}
            onChangeText={setKeywordInput}
            onSubmitEditing={handleAddKeyword}
          />
          <TouchableOpacity onPress={handleAddKeyword} style={styles.addButton}>
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.keywordList}>
          {keywords.map((keyword, index) => (
            <View key={index} style={styles.keywordChip}>
              <Text style={styles.keywordText}>#{keyword}</Text>
              <TouchableOpacity onPress={() => handleRemoveKeyword(keyword)}>
                <Ionicons name="close-circle" size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.divider} />

      {/* 3. 메뉴 리스트 */}
      <View style={styles.menuList}>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Text style={[styles.menuItemText, { color: "#FF3B30" }]}>
            로그아웃
          </Text>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* 4. 내 글 목록 헤더 */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="document-text-outline" size={20} color="#333" />
          <Text style={styles.sectionTitle}>내가 쓴 글</Text>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={myPosts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 40 }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={{ margin: 20 }} />
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>작성한 게시글이 없습니다.</Text>
            </View>
          ) : (
            <ActivityIndicator style={{ marginTop: 20 }} />
          )
        }
        refreshing={false}
        onRefresh={refetch}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  // ... 기존 스타일 유지 ...

  // 새로 추가된 게시글 카드 스타일
  postCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  postTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  postTime: {
    fontSize: 12,
    color: "#8E8E93",
  },
  postContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  postStats: { flexDirection: "row" },
  statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 12, color: "#8E8E93" },

  // Empty State
  emptyContainer: { alignItems: "center", padding: 30 },
  emptyText: { color: "#8E8E93" },

  // 기존 스타일들 (복붙해서 사용하세요)
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#F9F9F9",
  },
  emailText: { marginTop: 8, fontSize: 14, color: "#8E8E93" },
  nicknameContainer: { marginTop: 12, minHeight: 40, justifyContent: "center" },
  displayRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  nicknameText: { fontSize: 20, fontWeight: "700", color: "#333" },
  editIcon: { padding: 4 },
  editRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  nicknameInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#007AFF",
    fontSize: 18,
    color: "#333",
    paddingVertical: 4,
    width: 120,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  saveButtonText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  cancelButton: { paddingHorizontal: 8, paddingVertical: 6 },
  cancelButtonText: { color: "#8E8E93", fontSize: 12 },
  divider: { height: 8, backgroundColor: "#F5F5F5" },
  sectionContainer: { padding: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  sectionDesc: { fontSize: 13, color: "#8E8E93", marginBottom: 16 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  keywordInput: {
    flex: 1,
    height: 44,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    marginRight: 8,
    color: "#333",
  },
  addButton: {
    width: 44,
    height: 44,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  keywordList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  keywordChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BBDEFB",
    gap: 6,
  },
  keywordText: { fontSize: 14, color: "#007AFF", fontWeight: "500" },
  menuList: { paddingHorizontal: 16 },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  menuItemText: { fontSize: 16, color: "#333" },
});
