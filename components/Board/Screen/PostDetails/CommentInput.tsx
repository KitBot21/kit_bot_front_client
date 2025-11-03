import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CommentInputProps {
  onSubmit: (text: string) => void;
  isSubmitting?: boolean;
}

export default function CommentInput({
  onSubmit,
  isSubmitting = false,
}: CommentInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim() && !isSubmitting) {
      onSubmit(text.trim());
      setText("");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="답변을 입력하세요"
        multiline
        editable={!isSubmitting}
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          (!text.trim() || isSubmitting) && styles.sendButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!text.trim() || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="send" size={20} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#C7C7CC",
  },
});
