import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommentResponseDTO } from "@/components/api/types/APITypes/CommentTypes";
interface CommentItemProps {
  comment: CommentResponseDTO;
  onAdoptAnswer: (commentId: string) => void;
  onReply: (text: string, parentId: string) => void;
}

export default function CommentItem({
  comment,
  onAdoptAnswer,
  onReply,
}: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(replyText.trim(), comment.id);
      setReplyText("");
      setShowReplyInput(false);
    }
  };

  const isAnswer = comment.status === "active";

  return (
    <View style={styles.container}>
      <View style={[styles.commentCard, isAnswer && styles.answerCard]}>
        {isAnswer && (
          <View style={styles.answerBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
          </View>
        )}
        <View style={styles.commentHeader}>
          <View style={styles.commentAuthorInfo}>
            <View style={styles.commentAvatar}>
              <Ionicons name="person" size={16} color="#fff" />
            </View>
            <Text style={styles.commentAuthor}>{comment.authorName}</Text>
            <Text style={styles.commentTime}>
              {new Date(comment.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <Text style={styles.commentContent}>{comment.content}</Text>

        <TouchableOpacity
          style={styles.replyButton}
          onPress={() => setShowReplyInput(!showReplyInput)}
        >
          <Text style={styles.replyButtonText}>답글</Text>
        </TouchableOpacity>

        {showReplyInput && (
          <View style={styles.replyInputContainer}>
            <TextInput
              style={styles.replyInput}
              value={replyText}
              onChangeText={setReplyText}
              placeholder="답글을 입력하세요"
              multiline
            />
            <TouchableOpacity
              style={styles.replySubmitButton}
              onPress={handleReplySubmit}
            >
              <Text style={styles.replySubmitButtonText}>전송</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  commentCard: {
    padding: 20,
    backgroundColor: "#ffffffff",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  answerCard: {
    backgroundColor: "#F0FFF4",
    borderColor: "#34C759",
  },
  answerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  commentAuthorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#8E8E93",
    justifyContent: "center",
    alignItems: "center",
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  commentTime: {
    fontSize: 12,
    color: "#8E8E93",
  },
  commentContent: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  replyButton: {
    alignSelf: "flex-start",
  },
  replyButtonText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "600",
  },
  replyInputContainer: {
    marginTop: 12,
    gap: 8,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
  },
  replySubmitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  replySubmitButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
