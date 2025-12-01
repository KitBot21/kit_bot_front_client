import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  StyleSheet,
  Linking,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SourceDTO } from "@/components/api/types/APITypes/chat_types";
import { usePostChatQuery } from "@/components/hooks/usePostChatQuery";
import { RootStackParamList } from "@/App";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  sources?: SourceDTO[];
  isDate?: boolean;
}

export default function ChatbotScreen() {
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: t("chat.greeting"),
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

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

  const { mutate: sendQuery, isPending } = usePostChatQuery({
    onSuccess: (data) => {
      const botMessage: Message = {
        id: Date.now().toString(),
        text: data.answer,
        sender: "bot",
        timestamp: new Date(),
        sources: data.sources,
        isDate: data.isDate,
      };
      setMessages((prev) => [...prev, botMessage]);
    },

    onError: (error) => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `${t("chat.error")}: ${error.message}`,
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

  const handleGoToCalendar = (messageText: string) => {
    navigation.navigate("Calendar");
  };

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

          {!isUser && item.isDate && (
            <TouchableOpacity
              style={styles.calendarButton}
              onPress={() => handleGoToCalendar(item.text)}
            >
              <Ionicons name="calendar-outline" size={16} color="#007AFF" />
              <Text style={styles.calendarButtonText}>
                {t("chat.addToCalendar")}
              </Text>
            </TouchableOpacity>
          )}

          {!isUser && item.sources && item.sources.length > 0 && (
            <View style={styles.sourceContainer}>
              <Text style={styles.sourceTitle}>{t("chat.sources")}:</Text>
              {item.sources.map((source) => (
                <TouchableOpacity
                  key={source.docId}
                  onPress={() => Linking.openURL(source.link)}
                >
                  <Text style={styles.sourceLink} numberOfLines={1}>
                    - {source.title}
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
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        keyboardDismissMode="interactive"
      />

      {isPending && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#555" />
          <Text style={styles.loadingText}>{t("chat.generating")}</Text>
        </View>
      )}

      <KeyboardStickyView
        offset={{
          closed: -5,
          opened: Platform.OS === "ios" ? 20 : 0,
        }}
      >
        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom: keyboardVisible ? 12 : Math.max(insets.bottom, 12),
            },
          ]}
        >
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t("chat.placeholder")}
            multiline
            editable={!isPending}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (inputText.trim() === "" || isPending) &&
                styles.sendButtonDisabled,
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
      </KeyboardStickyView>
    </View>
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
  sourceLink: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
    marginBottom: 2,
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
    paddingTop: 12,
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
  calendarButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 8,
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  calendarButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
