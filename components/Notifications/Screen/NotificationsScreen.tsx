import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { NotificationItem } from "@/components/api/types/APITypes/notification";
import {
  useMyNotifications,
  useMarkNotificationAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from "@/components/hooks/useNotification";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const KEYWORD_ICONS: Record<string, string> = {
  SCHOLARSHIP: "school-outline",
  COURSE: "book-outline",
  DORM: "home-outline",
  EVENT: "calendar-outline",
  EMPLOYMENT: "briefcase-outline",
};

export default function NotificationsScreen() {
  const { data: notifications, isLoading, refetch } = useMyNotifications();
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { mutate: deleteAllNotifications } = useDeleteAllNotifications();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();

  const handleNotificationPress = (item: NotificationItem) => {
    if (!item.read) {
      markAsRead(item.id);
    }

    if (item.noticeId) {
      Linking.openURL(item.noticeId).catch((err) => {
        console.error("링크 열기 실패:", err);
      });
    }
  };

  const handleDeleteOne = (notificationId: string) => {
    deleteNotification(notificationId);
  };

  const handleDeleteAll = () => {
    Alert.alert(
      t("notifications.deleteAllTitle"),
      t("notifications.deleteAllConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => deleteAllNotifications(),
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (i18n.language === "ko") {
      if (minutes < 1) return "방금 전";
      if (minutes < 60) return `${minutes}분 전`;
      if (hours < 24) return `${hours}시간 전`;
      if (days < 7) return `${days}일 전`;
    } else {
      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
    }

    return date.toLocaleDateString(i18n.language === "ko" ? "ko-KR" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const renderRightActions = (notificationId: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDeleteOne(notificationId)}
      >
        <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
        <Text style={styles.deleteActionText}>{t("common.delete")}</Text>
      </TouchableOpacity>
    );
  };

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => {
    const iconName = KEYWORD_ICONS[item.keyword] || "notifications-outline";
    const keywordLabel = t(`keywords.${item.keyword}`);

    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item.id)}
        overshootRight={false}
      >
        <TouchableOpacity
          style={[styles.notificationCard, !item.read && styles.unreadCard]}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, !item.read && styles.unreadIcon]}>
            <Ionicons
              name={iconName as any}
              size={24}
              color={item.read ? "#8E8E93" : "#007AFF"}
            />
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.headerRow}>
              <View style={styles.keywordBadge}>
                <Text style={styles.keywordText}>{keywordLabel}</Text>
              </View>
              <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
            </View>

            <Text
              style={[styles.titleText, !item.read && styles.unreadTitle]}
              numberOfLines={2}
            >
              {item.title}
            </Text>

            <View style={styles.linkRow}>
              <Ionicons name="link-outline" size={14} color="#8E8E93" />
              <Text style={styles.linkText} numberOfLines={1}>
                {t("notifications.goToNotice")}
              </Text>
            </View>
          </View>

          {!item.read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      </Swipeable>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <View style={styles.titleLeft}>
          <Ionicons name="notifications" size={24} color="#007AFF" />
          <Text style={styles.screenTitle}>{t("notifications.title")}</Text>
        </View>

        {notifications && notifications.length > 0 && (
          <TouchableOpacity
            style={styles.deleteAllButton}
            onPress={handleDeleteAll}
          >
            <Text style={styles.deleteAllText}>
              {t("notifications.deleteAll")}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: insets.bottom + 8 },
        ]}
        refreshing={false}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={64}
              color="#E0E0E0"
            />
            <Text style={styles.emptyTitle}>{t("notifications.empty")}</Text>
            <Text style={styles.emptyDesc}>{t("notifications.emptyDesc")}</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  deleteAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteAllText: {
    fontSize: 14,
    color: "#FF3B30",
    fontWeight: "500",
  },
  listContainer: {
    paddingVertical: 8,
  },
  notificationCard: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
  },
  unreadCard: {
    backgroundColor: "#F8FAFF",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  unreadIcon: {
    backgroundColor: "#E8F2FF",
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  keywordBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  keywordText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#007AFF",
  },
  timeText: {
    fontSize: 12,
    color: "#8E8E93",
  },
  titleText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 21,
    marginBottom: 6,
  },
  unreadTitle: {
    fontWeight: "600",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  linkText: {
    fontSize: 12,
    color: "#8E8E93",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    alignSelf: "center",
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 72,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  deleteAction: {
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    flexDirection: "column",
    gap: 4,
  },
  deleteActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
