import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/components/contexts/AuthContext";
import { useMyPosts } from "@/components/hooks/postQuery";
import { Post } from "@/components/api/types/APITypes/postTypes";
import { useGoogleAuth } from "@/components/hooks/useGoogleAuth";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useTranslation } from "react-i18next";

import {
  useNoticeKeywords,
  useMyKeywords,
  useToggleKeyword,
} from "@/components/hooks/useNoticeKeywords";
import { useNavigation } from "expo-router";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/App";

export default function MyPageScreen() {
  const router = useRouter();
  const { user, updateUser, isLoading: isAuthLoading } = useAuth();
  const { signOut } = useGoogleAuth();
  const { t } = useTranslation();

  const navigate =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useMyPosts();

  const { data: noticeKeywords, isLoading: isKeywordsLoading } =
    useNoticeKeywords();
  const { data: myKeywords } = useMyKeywords();
  const { mutate: toggleKeyword, isPending: isToggling } = useToggleKeyword();

  const myPosts = data?.pages.flatMap((page) => page.content) ?? [];

  const [isEditing, setIsEditing] = useState(false);
  const [newNickname, setNewNickname] = useState(user?.username || "");

  const isKeywordEnabled = (keyword: string) => {
    if (!myKeywords) return false;
    const found = myKeywords.find((item) => item.keyword === keyword);
    return found?.enabled ?? false;
  };

  const handleToggleKeyword = (keyword: string) => {
    if (isToggling) return;
    toggleKeyword(keyword);
  };

  const handleSaveNickname = async () => {
    if (!newNickname.trim()) return;
    try {
      if (user) {
        await updateUser({ ...user, username: newNickname });
        setIsEditing(false);
        Alert.alert(t("common.confirm"), t("mypage.nicknameChanged"));
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("common.failed"));
    }
  };

  const handleLogout = () => {
    Alert.alert(t("mypage.logout"), t("mypage.logoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("mypage.logout"),
        style: "destructive",
        onPress: async () => {
          await signOut();
          navigate.replace("MainTabs");
        },
      },
    ]);
  };

  const handleLogin = () => {
    navigate.navigate("Login");
  };

  // 로딩 중일 때
  if (isAuthLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // 로그인 안 된 상태
  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="person-circle-outline" size={100} color="#C7C7CC" />
        <Text style={styles.loginTitle}>{t("mypage.loginRequired")}</Text>
        <Text style={styles.loginSubtitle}>{t("mypage.loginDesc")}</Text>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Ionicons name="logo-google" size={20} color="#FFFFFF" />
          <Text style={styles.loginButtonText}>{t("mypage.googleLogin")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 로그인 된 상태 - 기존 UI
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

  const renderHeader = () => (
    <View>
      {/* 1. 프로필 섹션 */}
      <View style={styles.profileSection}>
        <Ionicons name="person-circle-outline" size={80} color="#007AFF" />
        <Text style={styles.emailText}>{user?.email || "user@email.com"}</Text>

        {/* role 표시 (학교 인증 상태) */}
        <View style={styles.roleContainer}>
          {user?.role === "guest" ? (
            <TouchableOpacity
              style={styles.roleChipGuest}
              onPress={() => navigate.navigate("SchoolAuth")}
            >
              <Ionicons name="school-outline" size={14} color="#FF9500" />
              <Text style={styles.roleTextGuest}>
                {t("mypage.notVerified")}
              </Text>
              <Ionicons name="chevron-forward" size={14} color="#FF9500" />
            </TouchableOpacity>
          ) : (
            <View style={styles.roleChipVerified}>
              <Ionicons name="checkmark-circle" size={14} color="#34C759" />
              <Text style={styles.roleTextVerified}>
                {t("mypage.verified")}
              </Text>
            </View>
          )}
        </View>

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
                <Text style={styles.saveButtonText}>{t("common.save")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsEditing(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.displayRow}>
              <Text style={styles.nicknameText}>
                {user?.username || t("mypage.nicknameEmpty")}
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
          <Text style={styles.sectionTitle}>
            {t("mypage.keywordSubscription")}
          </Text>
        </View>
        <Text style={styles.sectionDesc}>{t("mypage.keywordDesc")}</Text>

        {isKeywordsLoading ? (
          <ActivityIndicator style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.keywordList}>
            {noticeKeywords?.map((keyword) => {
              const enabled = isKeywordEnabled(keyword.key);
              return (
                <TouchableOpacity
                  key={keyword.key}
                  style={[
                    styles.keywordChip,
                    enabled && styles.keywordChipActive,
                  ]}
                  onPress={() => handleToggleKeyword(keyword.key)}
                  disabled={isToggling}
                >
                  <Text
                    style={[
                      styles.keywordText,
                      enabled && styles.keywordTextActive,
                    ]}
                  >
                    {t(`keywords.${keyword.key}`)}
                  </Text>
                  <Ionicons
                    name={enabled ? "checkmark-circle" : "add-circle-outline"}
                    size={18}
                    color={enabled ? "#FFFFFF" : "#007AFF"}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* 3. 메뉴 리스트 */}
      <View style={styles.menuList}>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Text style={[styles.menuItemText, { color: "#FF3B30" }]}>
            {t("mypage.logout")}
          </Text>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* 4. 내 글 목록 헤더 */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="document-text-outline" size={20} color="#333" />
          <Text style={styles.sectionTitle}>{t("mypage.myPosts")}</Text>
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
              <Text style={styles.emptyText}>{t("mypage.noPosts")}</Text>
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

  // 로그인 필요 화면
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 32,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginTop: 24,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // 기존 스타일들
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

  emptyContainer: { alignItems: "center", padding: 30 },
  emptyText: { color: "#8E8E93" },

  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#F9F9F9",
  },
  emailText: { marginTop: 8, fontSize: 14, color: "#8E8E93" },

  // role 표시 스타일
  roleContainer: {
    marginTop: 12,
  },
  roleChipGuest: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  roleTextGuest: {
    fontSize: 12,
    color: "#FF9500",
    fontWeight: "500",
  },
  roleChipVerified: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  roleTextVerified: {
    fontSize: 12,
    color: "#34C759",
    fontWeight: "500",
  },

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

  keywordList: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  keywordChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    gap: 6,
  },
  keywordChipActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  keywordText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  keywordTextActive: {
    color: "#FFFFFF",
  },

  menuList: { paddingHorizontal: 16 },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  menuItemText: { fontSize: 16, color: "#333" },
});
