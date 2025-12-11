import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommentResponseDTO } from "@/components/api/types/APITypes/commentTypes";
import {
  useToggleRecommendComment,
  useReportComment,
  useDeleteComment,
} from "@/components/hooks/commentQuery";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/components/contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/App";

interface CommentItemProps {
  comment: CommentResponseDTO;
  replies: CommentResponseDTO[];
  onAdoptAnswer: (commentId: string) => void;
  onReplyPress: () => void;
}

export default function CommentItem({
  comment,
  replies,
  onAdoptAnswer,
  onReplyPress,
}: CommentItemProps) {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showReplies, setShowReplies] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showReplyMenuModal, setShowReplyMenuModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedReplyId, setSelectedReplyId] = useState<string | null>(null);

  const toggleRecommendMutation = useToggleRecommendComment();
  const reportMutation = useReportComment();
  const deleteCommentMutation = useDeleteComment();
  const { user } = useAuth();
  const isMyComment = user && comment.authorId === user.id;

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

  const handleToggleRecommend = () => {
    if (!checkKumohAuth()) return;
    toggleRecommendMutation.mutate(comment.id);
  };

  const handleReportPress = () => {
    if (!checkKumohAuth()) return;
    if (comment.isReported) return;
    setShowReportModal(true);
  };

  const handleReplyPress = () => {
    if (!checkKumohAuth()) return;
    onReplyPress();
  };

  const handleSelectReason = (reason: string) => {
    setSelectedReason(reason);
    setShowReportModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmReport = () => {
    reportMutation.mutate(
      { commentId: comment.id, reason: selectedReason },
      {
        onSuccess: () => {
          setShowConfirmModal(false);
          Alert.alert(t("comment.reportComplete"), t("comment.reportSuccess"), [
            { text: t("common.confirm") },
          ]);
        },
      }
    );
  };

  const handleDeleteComment = () => {
    setShowMenuModal(false);
    Alert.alert(t("comment.deleteComment"), t("comment.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => {
          deleteCommentMutation.mutate(comment.id, {
            onSuccess: () => {
              Alert.alert(
                t("comment.deleteComplete"),
                t("comment.deleteSuccess")
              );
            },
            onError: (error: Error) => {
              Alert.alert(
                t("common.error"),
                error.message || t("comment.deleteFailed")
              );
            },
          });
        },
      },
    ]);
  };

  const handleDeleteReply = (replyId: string) => {
    setShowReplyMenuModal(false);
    Alert.alert(t("comment.deleteReply"), t("comment.deleteReplyConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => {
          deleteCommentMutation.mutate(replyId, {
            onSuccess: () => {
              Alert.alert(
                t("comment.deleteComplete"),
                t("comment.deleteReplySuccess")
              );
            },
            onError: (error: Error) => {
              Alert.alert(
                t("common.error"),
                error.message || t("comment.deleteReplyFailed")
              );
            },
          });
        },
      },
    ]);
  };

  const handleReplyMenuPress = (replyId: string) => {
    setSelectedReplyId(replyId);
    setShowReplyMenuModal(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.commentCard}>
        <View style={styles.commentHeader}>
          <View style={styles.commentAvatar}>
            <Ionicons name="person" size={16} color="#fff" />
          </View>
          <View style={styles.commentInfo}>
            <Text style={styles.commentAuthor}>{comment.authorName}</Text>
            <Text style={styles.commentTime}>
              {formatDate(comment.createdAt)}
            </Text>
          </View>
          {isMyComment && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowMenuModal(true)}
            >
              <Ionicons name="ellipsis-vertical" size={16} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.commentContent}>{comment.content}</Text>

        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleReplyPress}
          >
            <Text style={styles.actionText}>{t("comment.reply")}</Text>
          </TouchableOpacity>

          <View style={styles.rightActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleToggleRecommend}
              disabled={toggleRecommendMutation.isPending}
            >
              <Ionicons
                name={comment.isRecommended ? "heart" : "heart-outline"}
                size={18}
                color={comment.isRecommended ? "#FF3B30" : "#8E8E93"}
              />
              {comment.recommendCount > 0 && (
                <Text style={styles.countText}>{comment.recommendCount}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleReportPress}
              disabled={comment.isReported}
            >
              <Ionicons
                name={
                  comment.isReported ? "alert-circle" : "alert-circle-outline"
                }
                size={18}
                color={comment.isReported ? "#FF3B30" : "#8E8E93"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {replies.length > 0 && (
          <TouchableOpacity
            style={styles.showRepliesButton}
            onPress={() => setShowReplies(!showReplies)}
          >
            <Ionicons
              name={showReplies ? "chevron-up" : "chevron-down"}
              size={16}
              color="#007AFF"
            />
            <Text style={styles.showRepliesText}>
              {showReplies
                ? t("comment.hideReplies")
                : t("comment.showReplies", { count: replies.length })}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showReplies &&
        replies.map((reply) => {
          const isMyReply = user && reply.authorId === user.id;

          return (
            <View key={reply.id} style={styles.replyContainer}>
              <Ionicons
                name="return-down-forward"
                size={20}
                color="#8E8E93"
                style={styles.replyIcon}
              />
              <View style={styles.replyCard}>
                <View style={styles.replyHeader}>
                  <View style={styles.replyAvatar}>
                    <Ionicons name="person" size={12} color="#fff" />
                  </View>
                  <Text style={styles.replyAuthor}>{reply.authorName}</Text>
                  <Text style={styles.replyTime}>
                    {formatDate(reply.createdAt)}
                  </Text>
                  {isMyReply && (
                    <TouchableOpacity
                      style={styles.replyMenuButton}
                      onPress={() => handleReplyMenuPress(reply.id)}
                    >
                      <Ionicons
                        name="ellipsis-vertical"
                        size={14}
                        color="#8E8E93"
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.replyContent}>{reply.content}</Text>
              </View>
            </View>
          );
        })}

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
                  onPress={handleDeleteComment}
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

      <Modal
        visible={showReplyMenuModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReplyMenuModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowReplyMenuModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuModal}>
                <TouchableOpacity
                  style={styles.menuOption}
                  onPress={() =>
                    selectedReplyId && handleDeleteReply(selectedReplyId)
                  }
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  <Text style={styles.deleteOptionText}>
                    {t("common.delete")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelMenuButton}
                  onPress={() => setShowReplyMenuModal(false)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  commentCard: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  commentInfo: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  commentTime: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 2,
  },
  menuButton: {
    padding: 4,
  },
  commentContent: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  commentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButton: {
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "500",
  },
  rightActions: {
    flexDirection: "row",
    gap: 16,
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 4,
  },
  countText: {
    fontSize: 12,
    color: "#FF3B30",
    fontWeight: "600",
  },
  showRepliesButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  showRepliesText: {
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "500",
  },
  replyContainer: {
    flexDirection: "row",
    paddingLeft: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  replyIcon: {
    marginRight: 8,
    marginTop: 4,
  },
  replyCard: {
    flex: 1,
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  replyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#8E8E93",
    justifyContent: "center",
    alignItems: "center",
  },
  replyAuthor: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  replyTime: {
    fontSize: 11,
    color: "#8E8E93",
  },
  replyMenuButton: {
    padding: 4,
    marginLeft: "auto",
  },
  replyContent: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 8,
    width: "40%",
    maxWidth: 150,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
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
});
