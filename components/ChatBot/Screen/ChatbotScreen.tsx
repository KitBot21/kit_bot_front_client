import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SourceDTO } from "@/components/api/types/APITypes/chat_types";
import { usePostChatQuery } from "@/components/api/hooks/usePostChatQuery";
interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  sources?: SourceDTO[];
}

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "안녕하세요! KIT 봇입니다. 무엇을 도와드릴까요?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const { mutate: sendQuery, isPending } = usePostChatQuery({
    onSuccess: (data) => {
      const botMessage: Message = {
        id: Date.now().toString(),
        text: data.answer,
        sender: "bot",
        timestamp: new Date(),
        sources: data.sources,
      };
      setMessages((prev) => [...prev, botMessage]);
    },

    onError: (error) => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `오류가 발생했습니다: ${error.message}`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100
      );
    }
  }, [messages]);

  const sendMessage = () => {
    if (inputText.trim() === "" || isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    sendQuery(inputText);

    setInputText("");
  };

  // 메시지 및 출처 렌더링
  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user";
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.botMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.botBubble,
          ]}
        >
          <Text style={isUser ? styles.userText : styles.botText}>
            {item.text}
          </Text>
          {!isUser && item.sources && item.sources.length > 0 && (
            <View style={styles.sourceContainer}>
              <Text style={styles.sourceTitle}>관련 출처:</Text>
              {item.sources.map((source) => (
                <TouchableOpacity
                  key={source.docId}
                  onPress={() => Linking.openURL(source.link)}
                >
                  <Text style={styles.sourceLink} numberOfLines={1}>
                    {source.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
      />

      {isPending && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#555" />
          <Text style={styles.loadingText}>답변을 생성 중입니다...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="메시지를 입력하세요..."
          multiline
          editable={!isPending}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (inputText.trim() === "" || isPending) && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={inputText.trim() === "" || isPending}
        >
          <Ionicons
            name="send"
            size={20}
            color={inputText.trim() === "" || isPending ? "#ccc" : "#007AFF"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  messageList: { paddingHorizontal: 16, paddingVertical: 12 },
  messageContainer: { marginBottom: 12 },
  userMessage: { alignItems: "flex-end" },
  botMessage: { alignItems: "flex-start" },
  messageBubble: {
    maxWidth: "85%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: { backgroundColor: "#007AFF" },
  botBubble: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  userText: { color: "#FFFFFF", fontSize: 15, lineHeight: 20 },
  botText: { color: "#333", fontSize: 15, lineHeight: 20 },
  sourceContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#ECECEC",
  },
  sourceTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 5,
  },
  sourceLink: { fontSize: 14, color: "#007AFF", fontWeight: "500" },
  sourceSnippet: {
    fontSize: 12,
    color: "#777",
    fontStyle: "italic",
    marginBottom: 5,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  loadingText: { marginLeft: 8, fontSize: 14, color: "#555" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    fontSize: 15,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  sendButtonDisabled: { opacity: 0.5 },
});
