import {
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
import { useUpdatePost, usePost } from "@/components/hooks/postQuery";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/components/contexts/AuthContext";

type QuestionEditRouteProp = RouteProp<RootStackParamList, "QuestionEdit">;

export default function QuestionEdit() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<QuestionEditRouteProp>();
  const postId = route.params?.postId;
  const { t } = useTranslation();
  const { user } = useAuth();

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
      Alert.alert(t("postEdit.cancelTitle"), t("postEdit.cancelMessage"), [
        { text: t("postEdit.continueWriting"), style: "cancel" },
        {
          text: t("common.cancel"),
          style: "destructive",
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = () => {
    if (!user) {
      Alert.alert(t("common.alert"), t("auth.loginRequired"));
      return;
    }

    if (!title.trim()) {
      Alert.alert(t("common.alert"), t("postEdit.enterTitle"));
      return;
    }

    if (!content.trim()) {
      Alert.alert(t("common.alert"), t("postEdit.enterContent"));
      return;
    }

    if (title === post?.title && content === post?.content) {
      Alert.alert(t("common.alert"), t("postEdit.noChanges"));
      return;
    }

    updatePost(
      {
        postId,
        data: {
          authorId: user.id,
          title: title.trim(),
          content: content.trim(),
        },
      },
      {
        onSuccess: () => {
          Alert.alert(t("postEdit.editComplete"), t("postEdit.editSuccess"), [
            {
              text: t("common.confirm"),
              onPress: () => navigation.goBack(),
            },
          ]);
        },
        onError: (error) => {
          Alert.alert(
            t("common.error"),
            error instanceof Error ? error.message : t("postEdit.editFailed")
          );
        },
      }
    );
  };

  if (isLoadingPost) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{t("board.loading")}</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{t("postEdit.notFound")}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{t("common.goBack")}</Text>
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
        <Text style={styles.headerTitle}>{t("postEdit.title")}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputSection}>
          <Text style={styles.label}>{t("postEdit.titleLabel")}</Text>
          <TextInput
            style={styles.titleInput}
            placeholder={t("postEdit.titlePlaceholder")}
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
            placeholder={t("postEdit.contentPlaceholder")}
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
          { bottom: 16 + insets.bottom },
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
            <Text style={styles.submitButtonText}>{t("postEdit.submit")}</Text>
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
