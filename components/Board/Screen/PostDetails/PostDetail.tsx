// PostDetail.tsx
import { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PostContent from "./PostContent";
import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";
import {
  useComments,
  useCreateComment,
  useReplies,
} from "@/components/api/hooks/commentQuery";
import { useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "@/App";
import { CommentResponseDTO } from "@/components/api/types/APITypes/commentTypes";
import { usePost } from "@/components/api/hooks/postQuery";
type PostDetailRouteProp = RouteProp<RootStackParamList, "PostDetail">;

function CommentItemWithReplies({
  comment,
  onAdoptAnswer,
  onReplyPress,
}: {
  comment: CommentResponseDTO;
  onAdoptAnswer: (id: string) => void;
  onReplyPress: (authorName: string) => void;
}) {
  const { data: replies = [] } = useReplies(comment.id);

  return (
    <CommentItem
      comment={comment}
      replies={replies}
      onAdoptAnswer={onAdoptAnswer}
      onReplyPress={() => onReplyPress(comment.authorName)}
    />
  );
}

export default function PostDetail() {
  const route = useRoute<PostDetailRouteProp>();
  const postId = route.params?.postId;

  console.log("PostDetail - postId:", postId);

  const inputRef = useRef<TextInput>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyAuthor, setReplyAuthor] = useState<string>("");

  const {
    data: post,
    isLoading: isPostLoading,
    error: postError,
    refetch: refetchPost,
  } = usePost(postId);

  const {
    data: comments = [],
    isLoading: isCommentsLoading,
    error: commentsError,
  } = useComments(postId);

  const createCommentMutation = useCreateComment();

  const handleAddComment = (text: string) => {
    createCommentMutation.mutate(
      {
        postId,
        content: text,
        parentId: replyTo,
      },
      {
        onSuccess: () => {
          setReplyTo(null);
          setReplyAuthor("");
        },
      }
    );
  };

  const handleReplyPress = (commentId: string, authorName: string) => {
    setReplyTo(commentId);
    setReplyAuthor(authorName);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleMarkAsAnswer = (commentId: string) => {
    console.log("답변 채택:", commentId);
  };

  const renderHeader = () => {
    if (!post) return null;

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

  // 로딩 상태
  if (isPostLoading || isCommentsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>게시글을 불러오는 중...</Text>
      </View>
    );
  }

  // 에러 상태
  if (postError || commentsError) {
    const errorMessage =
      postError?.message || commentsError?.message || "알 수 없는 오류";

    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>
          {postError
            ? "게시글을 불러올 수 없습니다"
            : "댓글을 불러올 수 없습니다"}
        </Text>
        <Text style={styles.errorDetailText}>{errorMessage}</Text>
        <Text style={styles.errorDetailText}>postId: {postId}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetchPost()}
        >
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 게시글이 없는 경우
  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#8E8E93" />
        <Text style={styles.errorText}>게시글을 찾을 수 없습니다</Text>
        <Text style={styles.errorDetailText}>postId: {postId}</Text>
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
          <CommentItemWithReplies
            comment={item}
            onAdoptAnswer={handleMarkAsAnswer}
            onReplyPress={(authorName) => handleReplyPress(item.id, authorName)}
          />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <CommentInput
        ref={inputRef}
        onSubmit={handleAddComment}
        isSubmitting={createCommentMutation.isPending}
        replyTo={replyAuthor}
        onCancelReply={() => {
          setReplyTo(null);
          setReplyAuthor("");
        }}
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8E8E93",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    gap: 12,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#8E8E93",
    fontWeight: "600",
  },
  errorDetailText: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
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
