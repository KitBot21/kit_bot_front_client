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
} from "@/components/api/hooks/commentQuery";

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

  const handleToggleRecommend = () => {
    toggleRecommendMutation.mutate(comment.id);
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
          Alert.alert("신고 완료", "신고가 완료되었습니다.", [
            { text: "확인" },
          ]);
        },
      }
    );
  };

  const handleDeleteComment = () => {
    setShowMenuModal(false);
    Alert.alert("댓글 삭제", "정말 이 댓글을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          deleteCommentMutation.mutate(comment.id, {
            onSuccess: () => {
              Alert.alert("삭제 완료", "댓글이 삭제되었습니다.");
            },
            onError: (error: Error) => {
              Alert.alert("오류", error.message || "댓글 삭제에 실패했습니다.");
            },
          });
        },
      },
    ]);
  };

  const handleDeleteReply = (replyId: string) => {
    setShowReplyMenuModal(false);
    Alert.alert("대댓글 삭제", "정말 이 대댓글을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          deleteCommentMutation.mutate(replyId, {
            onSuccess: () => {
              Alert.alert("삭제 완료", "대댓글이 삭제되었습니다.");
            },
            onError: (error: Error) => {
              Alert.alert(
                "오류",
                error.message || "대댓글 삭제에 실패했습니다."
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
              {new Date(comment.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowMenuModal(true)}
          >
            <Ionicons name="ellipsis-vertical" size={16} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <Text style={styles.commentContent}>{comment.content}</Text>

        <View style={styles.commentActions}>
          <TouchableOpacity style={styles.actionButton} onPress={onReplyPress}>
            <Text style={styles.actionText}>답글 달기</Text>
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
              onPress={() => setShowReportModal(true)}
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
              {showReplies ? "답글 숨기기" : `답글 ${replies.length}개 보기`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 대댓글 렌더링 */}
      {showReplies &&
        replies.map((reply) => (
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
                  {new Date(reply.createdAt).toLocaleDateString()}
                </Text>
                {/* 대댓글 메뉴 버튼 */}
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
              </View>
              <Text style={styles.replyContent}>{reply.content}</Text>
            </View>
          </View>
        ))}

      {/* 댓글 메뉴 모달 */}
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
                  <Text style={styles.deleteOptionText}>삭제</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelMenuButton}
                  onPress={() => setShowMenuModal(false)}
                >
                  <Text style={styles.cancelMenuText}>취소</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 대댓글 메뉴 모달 */}
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
                  <Text style={styles.deleteOptionText}>삭제</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelMenuButton}
                  onPress={() => setShowReplyMenuModal(false)}
                >
                  <Text style={styles.cancelMenuText}>취소</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 신고 모달 */}
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
                <Text style={styles.modalTitle}>신고 사유 선택</Text>

                <TouchableOpacity
                  style={styles.reportOption}
                  onPress={() => handleSelectReason("스팸/도배")}
                >
                  <Text style={styles.reportOptionText}>스팸/도배</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reportOption}
                  onPress={() => handleSelectReason("욕설/비방")}
                >
                  <Text style={styles.reportOptionText}>욕설/비방</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reportOption}
                  onPress={() => handleSelectReason("음란성")}
                >
                  <Text style={styles.reportOptionText}>음란성</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reportOption}
                  onPress={() => handleSelectReason("기타")}
                >
                  <Text style={styles.reportOptionText}>기타</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowReportModal(false)}
                >
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 신고 확인 모달 */}
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
                <Text style={styles.confirmTitle}>정말 신고하시겠습니까?</Text>
                <Text style={styles.confirmDescription}>
                  신고 후에는 취소할 수 없으며,{"\n"}
                  허위 신고 시 제재를 받을 수 있습니다.
                </Text>

                <View style={styles.confirmButtons}>
                  <TouchableOpacity
                    style={[styles.confirmButton, styles.cancelConfirmButton]}
                    onPress={() => setShowConfirmModal(false)}
                  >
                    <Text style={styles.cancelConfirmText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmButton, styles.reportConfirmButton]}
                    onPress={handleConfirmReport}
                    disabled={reportMutation.isPending}
                  >
                    <Text style={styles.reportConfirmText}>
                      {reportMutation.isPending ? "신고 중..." : "신고"}
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
