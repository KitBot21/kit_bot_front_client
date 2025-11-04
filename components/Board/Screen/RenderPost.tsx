import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Post } from "@/components/api/types/APITypes/postTypes";
import { useNavigation } from "expo-router";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/App";
import { useState } from "react";
import { useDeletePost } from "@/components/api/hooks/postQuery";

const USER_ID = "6908b0ea11c4a31b7f814a5a";

export default function RenderPost({ item }: { item: Post }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showMenuModal, setShowMenuModal] = useState(false);
  const deletePostMutation = useDeletePost();

  const handlePress = () => {
    navigation.navigate("PostDetail", { postId: item.id });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleMenuPress = (e: any) => {
    e.stopPropagation();
    setShowMenuModal(true);
  };

  const handleEdit = () => {
    setShowMenuModal(false);
    navigation.navigate("QuestionEdit", { postId: item.id });
  };

  const handleDelete = () => {
    setShowMenuModal(false);
    Alert.alert("게시글 삭제", "정말 이 게시글을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          deletePostMutation.mutate(item.id, {
            onSuccess: () => {
              Alert.alert("삭제 완료", "게시글이 삭제되었습니다.");
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

  const isMyPost = item.authorId === USER_ID;

  return (
    <>
      <TouchableOpacity style={styles.postCard} onPress={handlePress}>
        <View style={styles.titleRow}>
          <Text style={styles.postTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </View>

        <Text style={styles.postContent} numberOfLines={2}>
          {item.content}
        </Text>

        <View style={styles.postFooter}>
          <View style={styles.leftInfo}>
            <Text style={styles.postAuthor}>테스트 사용자</Text>
            <Text style={styles.postTime}>{formatDate(item.createdAt)}</Text>
          </View>

          <View style={styles.postStats}>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={14} color="#8E8E93" />
              <Text style={styles.statText}>{item.commentCount}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

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
  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  postTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    paddingRight: 8,
  },
  menuButton: {
    padding: 4,
  },
  postContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  postAuthor: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  postTime: {
    fontSize: 12,
    color: "#8E8E93",
    marginLeft: 8,
  },
  postStats: {
    flexDirection: "row",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#8E8E93",
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
