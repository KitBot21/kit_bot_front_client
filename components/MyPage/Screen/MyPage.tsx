import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/components/contexts/AuthContext";
import { useMyPosts } from "@/components/hooks/postQuery";
import { Post } from "@/components/api/types/APITypes/postTypes";
import { useGoogleAuth } from "@/components/hooks/useGoogleAuth";
import { useTranslation } from "react-i18next";
import { useWithdraw } from "@/components/hooks/useUsers";
import {
  useNoticeKeywords,
  useMyKeywords,
  useToggleKeyword,
} from "@/components/hooks/useNoticeKeywords";
import { useNavigation } from "expo-router";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/App";
import { Switch } from "react-native";
import { updateNotificationEnabled } from "@/components/api/services/chatApi";
import { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import { Linking } from "react-native";

export default function MyPageScreen() {
  const { user, isLoading: isAuthLoading, updateUser } = useAuth();
  const { signOut } = useGoogleAuth();
  const { t } = useTranslation();
  const [notificationEnabled, setNotificationEnabled] = useState<
    boolean | null
  >(null);
  const [osNotificationEnabled, setOsNotificationEnabled] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    const checkOsPermission = async () => {
      const settings = await Notifications.getPermissionsAsync();
      setOsNotificationEnabled(settings.granted);
    };

    checkOsPermission();
  }, []);

  const openSystemSettings = () => {
    Alert.alert(
      t("mypage.osNotificationDisabled"),
      t("mypage.osNotificationDisabledDesc"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("mypage.goToSettings"),
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  };

  useEffect(() => {
    if (user) {
      setNotificationEnabled(user.notificationEnabled ?? true);
    }
  }, [user]);

  const [isUpdating, setIsUpdating] = useState(false);

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
  const { mutate: withdraw, isPending: isWithdrawing } = useWithdraw();

  const { data: noticeKeywords, isLoading: isKeywordsLoading } =
    useNoticeKeywords();
  const { data: myKeywords } = useMyKeywords();
  const { mutate: toggleKeyword, isPending: isToggling } = useToggleKeyword();

  const myPosts = data?.pages.flatMap((page) => page.content) ?? [];

  const isKeywordEnabled = (keyword: string) => {
    if (!myKeywords) return false;
    const found = myKeywords.find((item) => item.keyword === keyword);
    return found?.enabled ?? false;
  };

  const handleToggleKeyword = (keyword: string) => {
    if (isToggling) return;
    toggleKeyword(keyword);
  };

  const handleToggleNotification = async (value: boolean) => {
    setIsUpdating(true);
    try {
      await updateNotificationEnabled(value);
      setNotificationEnabled(value);

      if (user) {
        updateUser({ ...user, notificationEnabled: value });
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("mypage.notificationUpdateFailed"));
    } finally {
      setIsUpdating(false);
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

  const handleWithdraw = () => {
    Alert.alert(t("mypage.withdrawTitle"), t("mypage.withdrawConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("mypage.withdraw"),
        style: "destructive",
        onPress: () => {
          Alert.alert(
            t("mypage.withdrawFinalTitle"),
            t("mypage.withdrawFinalConfirm"),
            [
              { text: t("common.cancel"), style: "cancel" },
              {
                text: t("mypage.withdraw"),
                style: "destructive",
                onPress: async () => {
                  withdraw(undefined, {
                    onSuccess: async () => {
                      await signOut();
                      Alert.alert(
                        t("mypage.withdrawComplete"),
                        t("mypage.withdrawCompleteDesc"),
                        [
                          {
                            text: t("common.confirm"),
                            onPress: () => navigate.replace("MainTabs"),
                          },
                        ]
                      );
                    },
                    onError: (error: Error) => {
                      Alert.alert(
                        t("common.error"),
                        error.message || t("mypage.withdrawFailed")
                      );
                    },
                  });
                },
              },
            ]
          );
        },
      },
    ]);
  };

  const handleEditNickname = () => {
    navigate.navigate("EditNickname");
  };

  if (isAuthLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

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

  const renderPostItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => navigate.navigate("PostDetail", { postId: item.id })}
    >
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
      <View style={styles.profileSection}>
        <Ionicons name="person-circle-outline" size={80} color="#007AFF" />
        <Text style={styles.emailText}>{user?.email || "user@email.com"}</Text>

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
          <TouchableOpacity
            style={styles.nicknameRow}
            onPress={handleEditNickname}
          >
            <Text style={styles.nicknameText}>
              {user?.username || t("mypage.nicknameEmpty")}
            </Text>
            <Ionicons name="pencil" size={16} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

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

      <View style={styles.sectionContainer}>
        <View style={styles.notificationRow}>
          <View style={styles.notificationInfo}>
            <Ionicons name="notifications-outline" size={20} color="#333" />
            <Text style={styles.notificationText}>
              {t("mypage.pushNotification")}
            </Text>
          </View>

          {osNotificationEnabled === false ? (
            <TouchableOpacity onPress={openSystemSettings}>
              <View style={styles.osDisabledBadge}>
                <Ionicons name="alert-circle" size={16} color="#FF9500" />
                <Text style={styles.osDisabledText}>
                  {t("mypage.systemOff")}
                </Text>
              </View>
            </TouchableOpacity>
          ) : notificationEnabled === null ? (
            <ActivityIndicator size="small" />
          ) : (
            <Switch
              value={notificationEnabled}
              onValueChange={handleToggleNotification}
              disabled={isUpdating}
              trackColor={{ false: "#E5E5E5", true: "#34C759" }}
              thumbColor="#FFFFFF"
            />
          )}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.menuList}>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Text style={[styles.menuItemText, { color: "#FF3B30" }]}>
            {t("mypage.logout")}
          </Text>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleWithdraw}
          disabled={isWithdrawing}
        >
          <Text style={[styles.menuItemText, { color: "#8E8E93" }]}>
            {isWithdrawing ? t("mypage.withdrawing") : t("mypage.withdraw")}
          </Text>
          <Ionicons name="person-remove-outline" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="document-text-outline" size={20} color="#333" />
          <Text style={styles.sectionTitle}>{t("mypage.myPosts")}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
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
    </View>
  );
}

const styles = StyleSheet.create({
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

  nicknameContainer: {
    marginTop: 16,
  },
  nicknameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nicknameText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },

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
  notificationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notificationText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  osDisabledBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  osDisabledText: {
    fontSize: 12,
    color: "#FF9500",
    fontWeight: "500",
  },
});
