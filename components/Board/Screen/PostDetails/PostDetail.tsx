import { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import PostContent from "./PostContent";
import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";
import {
  useComments,
  useCreateComment,
  useReplies,
} from "@/components/hooks/commentQuery";
import { useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "@/App";
import { CommentResponseDTO } from "@/components/api/types/APITypes/commentTypes";
import { usePost } from "@/components/hooks/postQuery";
import { useAuth } from "@/components/contexts/AuthContext";
import { useNavigation } from "expo-router";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  KeyboardStickyView,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import { useTranslation } from "react-i18next";
import { FlatListProps } from "react-native";

type PostDetailRouteProp = RouteProp<RootStackParamList, "PostDetail">;

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList as React.ComponentType<FlatListProps<CommentResponseDTO>>
);
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
  const { t } = useTranslation();
  const route = useRoute<PostDetailRouteProp>();
  const postId = route.params?.postId;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const canWrite = user?.role === "kumoh" || user?.role === "admin";
  const inputRef = useRef<TextInput>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyAuthor, setReplyAuthor] = useState<string>("");

  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();
  const [inputHeight, setInputHeight] = useState(60);

  const animatedStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboardHeight.value + inputHeight,
  }));

  const {
    data: post,
    isLoading: isPostLoading,
    error: postError,
    refetch: refetchPost,
  } = usePost(postId);

  useEffect(() => {
    if (post) {
      console.log("📦 게시글 응답:", JSON.stringify(post, null, 2));
    }
  }, [post]);

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

  const handleAuthRequest = () => {
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
  };

  const handleReplyPress = (commentId: string, authorName: string) => {
    if (!canWrite) {
      handleAuthRequest();
      return;
    }
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
            {t("postDetail.answerCount", { count: comments.length })}
          </Text>
        </View>
      </>
    );
  };

  const renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubble-outline" size={48} color="#C7C7CC" />
        <Text style={styles.emptyText}>{t("postDetail.emptyComment")}</Text>
      </View>
    );
  };

  if (isPostLoading || isCommentsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{t("postDetail.loading")}</Text>
      </View>
    );
  }

  if (postError || commentsError) {
    const errorMessage =
      postError?.message || commentsError?.message || t("common.unknownError");

    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>
          {postError
            ? t("postDetail.loadPostError")
            : t("postDetail.loadCommentError")}
        </Text>
        <Text style={styles.errorDetailText}>{errorMessage}</Text>
        <Text style={styles.errorDetailText}>postId: {postId}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetchPost()}
        >
          <Text style={styles.retryButtonText}>{t("common.retry")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#8E8E93" />
        <Text style={styles.errorText}>{t("postDetail.notFound")}</Text>
        <Text style={styles.errorDetailText}>postId: {postId}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedFlatList
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
        style={animatedStyle}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      />

      <KeyboardStickyView
        offset={{
          closed: 0,
          opened: Platform.OS === "ios" ? 20 : 0,
        }}
      >
        <View onLayout={(e) => setInputHeight(e.nativeEvent.layout.height)}>
          <CommentInput
            ref={inputRef}
            onSubmit={handleAddComment}
            isSubmitting={createCommentMutation.isPending}
            replyTo={replyAuthor}
            onCancelReply={() => {
              setReplyTo(null);
              setReplyAuthor("");
            }}
            placeholder={
              canWrite
                ? t("postDetail.commentPlaceholder")
                : t("postDetail.authRequired")
            }
            editable={canWrite}
            onAuthRequest={handleAuthRequest}
          />
        </View>
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
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
