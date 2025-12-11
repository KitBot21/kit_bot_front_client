import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Post } from "@/components/api/types/APITypes/postTypes";
import { useState } from "react";
import {
  useToggleRecommendPost,
  useReportPost,
  useDeletePost,
} from "@/components/hooks/postQuery";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/App";
import { useAuth } from "@/components/contexts/AuthContext";
import { useTranslation } from "react-i18next";

interface PostContentProps {
  post: Post;
}

export default function PostContent({ post }: PostContentProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const [showReportModal, setShowReportModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const { user } = useAuth();
  const displayName = post.authorNickname ?? t("common.anonymous");

  const toggleRecommendMutation = useToggleRecommendPost();
  const reportMutation = useReportPost();
  const deletePostMutation = useDeletePost();

  const checkKumohAuth = () => {
    if (!user || user.role === "guest") {
      Alert.alert(
        t("auth.verificationRequired"),
        t("auth.verificationRequiredDesc"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("auth.verify"),
            onPress: () => navigation.navigate("SchoolAuth"),
          },
        ]
      );
      return false;
    }
    return true;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return t("time.justNow");
    } else if (diffInMinutes < 60) {
      return t("time.minutesAgo", { count: diffInMinutes });
    } else if (diffInHours < 24) {
      return t("time.hoursAgo", { count: diffInHours });
    } else if (diffInDays < 7) {
      return t("time.daysAgo", { count: diffInDays });
    } else {
      return date.toLocaleDateString("ko-KR");
    }
  };

  const handleLike = () => {
    if (!checkKumohAuth()) return;
    toggleRecommendMutation.mutate(post.id);
  };

  const handleReport = () => {
    if (!checkKumohAuth()) return;
    if (post.reported) return;
    setShowReportModal(true);
  };

  const handleSelectReason = (reason: string) => {
    setSelectedReason(reason);
    setShowReportModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmReport = () => {
    setShowConfirmModal(false);

    reportMutation.mutate(
      { postId: post.id, reason: selectedReason },
      {
        onSuccess: () => {
          Alert.alert(t("comment.reportComplete"), t("comment.reportSuccess"), [
            { text: t("common.confirm") },
          ]);
        },
        onError: (error) => {
          Alert.alert(
            t("common.error"),
            error instanceof Error ? error.message : t("common.failed")
          );
        },
      }
    );
  };

  const handleMenuPress = () => {
    setShowMenuModal(true);
  };

  const handleEdit = () => {
    setShowMenuModal(false);
    navigation.navigate("QuestionEdit", { postId: post.id });
  };

  const handleDelete = () => {
    setShowMenuModal(false);
    Alert.alert(t("post.deleteTitle"), t("post.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => {
          deletePostMutation.mutate(post.id, {
            onSuccess: () => {
              Alert.alert(t("post.deleteComplete"), t("post.deleteSuccess"), [
                {
                  text: t("common.confirm"),
                  onPress: () => navigation.goBack(),
                },
              ]);
            },
            onError: (error: Error) => {
              Alert.alert(
                t("common.error"),
                error.message || t("post.deleteFailed")
              );
            },
          });
        },
      },
    ]);
  };

  const isMyPost = user && post.authorId === user.id;

  return (
    <>
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <View style={styles.authorInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.authorName}>{displayName}</Text>
              <Text style={styles.postTime}>{formatDate(post.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            {post.status === "RESOLVED" && (
              <View style={styles.resolvedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                <Text style={styles.resolvedText}>{t("post.resolved")}</Text>
              </View>
            )}
            {isMyPost && (
              <TouchableOpacity
                style={styles.menuButton}
                onPress={handleMenuPress}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postContent}>{post.content}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={20} color="#8E8E93" />
            <Text style={styles.statText}>{post.commentCount}</Text>
          </View>

          <TouchableOpacity
            style={styles.statItem}
            onPress={handleLike}
            disabled={toggleRecommendMutation.isPending}
          >
            <Ionicons
              name={post.recommended ? "heart" : "heart-outline"}
              size={20}
              color={post.recommended ? "#FF3B30" : "#8E8E93"}
            />
            <Text
              style={[styles.statText, post.recommended && styles.likedText]}
            >
              {post.recommendCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statItem}
            onPress={handleReport}
            disabled={post.reported}
          >
            <Ionicons
              name={post.reported ? "alert-circle" : "alert-circle-outline"}
              size={20}
              color={post.reported ? "#FF3B30" : "#8E8E93"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showReportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReportModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowReportModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.reportModal}>
                <Text style={styles.modalTitle}>
                  {t("comment.selectReportReason")}
                </Text>

                <TouchableOpacity
                  style={styles.reportOption}
                  onPress={() =>
                    handleSelectReason(t("comment.reportReasons.spam"))
                  }
                >
                  <Text style={styles.reportOptionText}>
                    {t("comment.reportReasons.spam")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reportOption}
                  onPress={() =>
                    handleSelectReason(t("comment.reportReasons.abuse"))
                  }
                >
                  <Text style={styles.reportOptionText}>
                    {t("comment.reportReasons.abuse")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reportOption}
                  onPress={() =>
                    handleSelectReason(t("comment.reportReasons.inappropriate"))
                  }
                >
                  <Text style={styles.reportOptionText}>
                    {t("comment.reportReasons.inappropriate")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reportOption}
                  onPress={() =>
                    handleSelectReason(t("comment.reportReasons.other"))
                  }
                >
                  <Text style={styles.reportOptionText}>
                    {t("comment.reportReasons.other")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowReportModal(false)}
                >
                  <Text style={styles.cancelButtonText}>
                    {t("common.cancel")}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowConfirmModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.confirmModal}>
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color="#FF3B30"
                  style={styles.confirmIcon}
                />
                <Text style={styles.confirmTitle}>
                  {t("comment.reportConfirmTitle")}
                </Text>
                <Text style={styles.confirmDescription}>
                  {t("comment.reportConfirmDescription")}
                </Text>

                <View style={styles.confirmButtons}>
                  <TouchableOpacity
                    style={[styles.confirmButton, styles.cancelConfirmButton]}
                    onPress={() => setShowConfirmModal(false)}
                  >
                    <Text style={styles.cancelConfirmText}>
                      {t("common.cancel")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmButton, styles.reportConfirmButton]}
                    onPress={handleConfirmReport}
                    disabled={reportMutation.isPending}
                  >
                    <Text style={styles.reportConfirmText}>
                      {reportMutation.isPending
                        ? t("comment.reporting")
                        : t("comment.report")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showMenuModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenuModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowMenuModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuModal}>
                <TouchableOpacity
                  style={styles.menuOption}
                  onPress={handleEdit}
                >
                  <Ionicons name="create-outline" size={20} color="#333" />
                  <Text style={styles.menuOptionText}>{t("common.edit")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuOption, styles.deleteOption]}
                  onPress={handleDelete}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  <Text style={styles.deleteOptionText}>
                    {t("common.delete")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelMenuButton}
                  onPress={() => setShowMenuModal(false)}
                >
                  <Text style={styles.cancelMenuText}>
                    {t("common.cancel")}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: "#F5F5F5",
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  authorName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  postTime: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resolvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
  },
  resolvedText: {
    fontSize: 12,
    color: "#34C759",
    fontWeight: "600",
  },
  menuButton: {
    padding: 4,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    lineHeight: 28,
  },
  postContent: {
    fontSize: 15,
    color: "#333",
    lineHeight: 24,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 20,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  likedText: {
    color: "#FF3B30",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  reportModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "80%",
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  reportOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  reportOptionText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  cancelButton: {
    paddingVertical: 16,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
    textAlign: "center",
  },
  confirmModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 340,
    alignItems: "center",
  },
  confirmIcon: {
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  confirmDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelConfirmButton: {
    backgroundColor: "#F0F0F0",
  },
  reportConfirmButton: {
    backgroundColor: "#FF3B30",
  },
  cancelConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  reportConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  menuModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 8,
    width: "50%",
    maxWidth: 200,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  deleteOption: {
    borderBottomWidth: 0,
  },
  menuOptionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  deleteOptionText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "500",
  },
  cancelMenuButton: {
    paddingVertical: 12,
    marginTop: 8,
    alignItems: "center",
  },
  cancelMenuText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
});
