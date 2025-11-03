import { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PostContent from "./PostContent";
import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";
import { PostDetailType } from "@/components/api/types/ComponentTypes/MockType";
import {
  useComments,
  useCreateComment,
} from "@/components/api/hooks/commentQuery";
import { useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "@/App";

interface PostDetailProps {
  postId: string;
}
type PostDetailRouteProp = RouteProp<RootStackParamList, "PostDetail">;

export default function PostDetail() {
  const route = useRoute<PostDetailRouteProp>();
  const postId = route.params.postId;

  const [post, setPost] = useState<PostDetailType>({
    id: postId,
    title: "React Native 상태 관리 라이브러리 추천 부탁드립니다",
    content:
      "챗봇에게 물어봤는데 명확한 답변을 못 받아서 여기에 질문 올립니다.\n\nReact Native 프로젝트에서 상태 관리를 어떻게 하는 게 좋을까요?",
    author: "개발초보",
    createdAt: "1시간 전",
    views: 42,
    isResolved: false,
    tags: ["챗봇 질문", "답변대기", "React Native"],
  });

  const { data: comments = [], isLoading, error } = useComments(postId);
  const createCommentMutation = useCreateComment();

  const handleAddComment = (text: string) => {
    createCommentMutation.mutate({
      postId,
      content: text,
      parentId: null,
    });
  };

  const handleAddReply = (text: string, parentId: string) => {
    createCommentMutation.mutate({
      postId,
      content: text,
      parentId,
    });
  };

  const handleMarkAsAnswer = (commentId: string) => {
    setPost({
      ...post,
      isResolved: true,
    });
  };

  const renderHeader = () => {
    return (
      <>
        <PostContent post={post} />
        <View style={styles.commentHeaderContainer}>
          <Text style={styles.commentHeaderTitle}>
            답변 {comments.length}개
          </Text>
        </View>
      </>
    );
  };

  const renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubble-outline" size={48} color="#C7C7CC" />
        <Text style={styles.emptyText}>첫 번째 답변을 작성해보세요!</Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#8E8E93" />
        <Text style={styles.errorText}>댓글을 불러올 수 없습니다</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        data={comments}
        renderItem={({ item }) => (
          <CommentItem
            comment={item}
            onAdoptAnswer={handleMarkAsAnswer}
            onReply={handleAddReply}
          />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <CommentInput
        onSubmit={handleAddComment}
        isSubmitting={createCommentMutation.isPending}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
  },
  listContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#8E8E93",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  emptyText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  commentHeaderContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  commentHeaderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
