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
} from "@/components/api/hooks/postQuery";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/App";

interface PostContentProps {
  post: Post;
}

const USER_ID = "6908b0ea11c4a31b7f814a5a"; // 임시 사용자 ID

export default function PostContent({ post }: PostContentProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showReportModal, setShowReportModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isReported, setIsReported] = useState(false);

  const toggleRecommendMutation = useToggleRecommendPost();
  const reportMutation = useReportPost();
  const deletePostMutation = useDeletePost();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    } else {
      return date.toLocaleDateString("ko-KR");
    }
  };

  const getAuthorName = (authorId: string) => {
    return authorId.substring(0, 8);
  };

  const handleLike = () => {
    toggleRecommendMutation.mutate(post.id, {
      onSuccess: () => {
        setIsLiked(!isLiked);
      },
    });
  };

  const handleReport = () => {
    if (isReported) {
      return;
    }
    setShowReportModal(true);
  };

  const handleSelectReason = (reason: string) => {
    setSelectedReason(reason);
    setShowReportModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmReport = () => {
    reportMutation.mutate(
      { postId: post.id, reason: selectedReason },
      {
        onSuccess: () => {
          setShowConfirmModal(false);
          setIsReported(true);
          Alert.alert("신고 완료", "신고가 완료되었습니다.", [
            { text: "확인" },
          ]);
        },
        onError: (error) => {
          setShowConfirmModal(false);
          Alert.alert(
            "오류",
            error instanceof Error ? error.message : "신고에 실패했습니다."
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
    Alert.alert("게시글 삭제", "정말 이 게시글을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          deletePostMutation.mutate(post.id, {
            onSuccess: () => {
              Alert.alert("삭제 완료", "게시글이 삭제되었습니다.", [
                {
                  text: "확인",
                  onPress: () => navigation.goBack(),
                },
              ]);
            },
            onError: (error: Error) => {
              Alert.alert(
                "오류",
                error.message || "게시글 삭제에 실패했습니다."
              );
            },
          });
        },
      },
    ]);
  };

  const isMyPost = post.authorId === USER_ID;

  return (
    <>
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <View style={styles.authorInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.authorName}>
                {getAuthorName(post.authorId)}
              </Text>
              <Text style={styles.postTime}>{formatDate(post.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            {post.status === "RESOLVED" && (
              <View style={styles.resolvedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                <Text style={styles.resolvedText}>해결됨</Text>
              </View>
            )}
            {/* {isMyPost && ( */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleMenuPress}
            >
              <Ionicons name="ellipsis-vertical" size={20} color="#8E8E93" />
            </TouchableOpacity>
            {/* )} */}
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
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? "#FF3B30" : "#8E8E93"}
            />
            <Text style={[styles.statText, isLiked && styles.likedText]}>
              {post.recommendCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statItem}
            onPress={handleReport}
            disabled={isReported}
          >
            <Ionicons
              name={isReported ? "alert-circle" : "alert-circle-outline"}
              size={20}
              color={isReported ? "#FF3B30" : "#8E8E93"}
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
                  <Text style={styles.menuOptionText}>수정</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuOption, styles.deleteOption]}
                  onPress={handleDelete}
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
