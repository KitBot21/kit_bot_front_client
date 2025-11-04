// CommentInput.tsx
import { useState, forwardRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CommentInputProps {
  onSubmit: (text: string) => void;
  isSubmitting?: boolean;
  replyTo?: string;
  onCancelReply?: () => void;
}

const CommentInput = forwardRef<TextInput, CommentInputProps>(
  ({ onSubmit, isSubmitting = false, replyTo, onCancelReply }, ref) => {
    const [text, setText] = useState("");

    const handleSubmit = () => {
      if (text.trim() && !isSubmitting) {
        onSubmit(text.trim());
        setText("");
      }
    };

    return (
      <View style={styles.container}>
        {replyTo && (
          <View style={styles.replyBanner}>
            <Text style={styles.replyText}>@{replyTo}에게 답글</Text>
            <TouchableOpacity onPress={onCancelReply}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            ref={ref}
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="댓글 입력..."
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
            blurOnSubmit={false}
            editable={!isSubmitting}
          />
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!text.trim()}
              style={styles.sendButton}
            >
              <Ionicons
                name="arrow-up-circle"
                size={32}
                color={text.trim() ? "#007AFF" : "#C7C7CC"}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  replyBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F0F0F0",
  },
  replyText: {
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "500",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    padding: 4,
  },
});

export default CommentInput;
