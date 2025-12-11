import { useState, forwardRef, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

interface CommentInputProps {
  onSubmit: (text: string) => void;
  isSubmitting?: boolean;
  replyTo?: string;
  onCancelReply?: () => void;
  placeholder?: string;
  editable?: boolean;
  onAuthRequest?: () => void;
}

const CommentInput = forwardRef<TextInput, CommentInputProps>(
  (
    {
      onSubmit,
      isSubmitting = false,
      replyTo,
      onCancelReply,
      placeholder,
      editable,
      onAuthRequest,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const [text, setText] = useState("");
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
      const showSub = Keyboard.addListener("keyboardDidShow", () => {
        setKeyboardVisible(true);
      });
      const hideSub = Keyboard.addListener("keyboardDidHide", () => {
        setKeyboardVisible(false);
      });

      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }, []);

    const handleSubmit = () => {
      if (text.trim() && !isSubmitting) {
        onSubmit(text.trim());
        setText("");
      }
    };

    const handleInputPress = () => {
      if (!editable && onAuthRequest) {
        onAuthRequest();
      }
    };

    return (
      <View style={styles.container}>
        {replyTo && (
          <View style={styles.replyBanner}>
            <Text style={styles.replyText}>
              {t("postDetail.replyTo", { name: replyTo })}
            </Text>
            <TouchableOpacity onPress={onCancelReply}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={editable ? 1 : 0.7}
          onPress={handleInputPress}
          disabled={editable}
        >
          <View
            style={[
              styles.inputRow,
              {
                paddingBottom: keyboardVisible
                  ? 12
                  : Math.max(insets.bottom, 12),
              },
            ]}
          >
            <TextInput
              ref={ref}
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder={placeholder}
              multiline
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
              blurOnSubmit={false}
              editable={!isSubmitting && editable}
              pointerEvents={editable ? "auto" : "none"}
            />
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!text.trim() || !editable}
                style={styles.sendButton}
              >
                <Ionicons
                  name="arrow-up-circle"
                  size={32}
                  color={text.trim() && editable ? "#007AFF" : "#C7C7CC"}
                />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
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
    paddingTop: 12,
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
