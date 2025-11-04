import {
  KeyboardAvoidingView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "@/App";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState, useEffect } from "react";
import { useUpdatePost, usePost } from "@/components/api/hooks/postQuery";

const USER_ID = "6908b0ea11c4a31b7f814a5a"; // 임시 사용자 ID

type QuestionEditRouteProp = RouteProp<RootStackParamList, "QuestionEdit">;

export default function QuestionEdit() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<QuestionEditRouteProp>();
  const postId = route.params?.postId;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: post, isLoading: isLoadingPost } = usePost(postId);
  const { mutate: updatePost, isPending } = useUpdatePost();

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
    }
  }, [post]);

  const onXPress = () => {
    if (title !== post?.title || content !== post?.content) {
      Alert.alert(
        "수정 취소",
        "수정한 내용이 저장되지 않습니다. 정말 취소하시겠습니까?",
        [
          { text: "계속 작성", style: "cancel" },
          {
            text: "취소",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("알림", "제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      Alert.alert("알림", "내용을 입력해주세요.");
      return;
    }

    if (title === post?.title && content === post?.content) {
      Alert.alert("알림", "수정된 내용이 없습니다.");
      return;
    }

    updatePost(
      {
        postId,
        data: {
          authorId: USER_ID,
          title: title.trim(),
          content: content.trim(),
        },
      },
      {
        onSuccess: () => {
          Alert.alert("수정 완료", "게시글이 수정되었습니다.", [
            {
              text: "확인",
              onPress: () => navigation.goBack(),
            },
          ]);
        },
        onError: (error) => {
          Alert.alert(
            "오류",
            error instanceof Error
              ? error.message
              : "게시글 수정에 실패했습니다."
          );
        },
      }
    );
  };

  if (isLoadingPost) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>게시글을 불러오는 중...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>게시글을 찾을 수 없습니다.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onXPress} disabled={isPending}>
          <AntDesign name="close" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>게시글 수정</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputSection}>
          <Text style={styles.label}>제목</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="제목을 입력해주세요."
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
            editable={!isPending}
            maxLength={100}
          />
        </View>

        <View style={styles.inputSection}>
          <TextInput
            style={styles.contentInput}
            placeholder="내용을 입력해주세요."
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
            editable={!isPending}
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.submitButton,
          (isPending || !title.trim() || !content.trim()) &&
            styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={isPending || !title.trim() || !content.trim()}
      >
        {isPending ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <AntDesign name="edit" size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>수정하기</Text>
          </>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  titleInput: {
    fontSize: 16,
    color: "#333",
    padding: 0,
  },
  contentInput: {
    fontSize: 14,
    color: "#333",
    minHeight: 300,
    padding: 0,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    position: "absolute",
    right: 16,
    bottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#007AFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: "#C7C7CC",
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8E8E93",
  },
  errorText: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
