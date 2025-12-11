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
  Alert,
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
import { usePopularKeywords } from "@/components/hooks/usePopularKeywords";
import { fetchLatestQuestionByKeyword } from "@/components/api/services/chatApi";
import { useAuth } from "@/components/contexts/AuthContext";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  sources?: SourceDTO[];
  isDate?: boolean;
  scheduleTitle?: string;
  startDate?: string;
  endDate?: string;
  originalQuestion?: string;
}

export default function ChatbotScreen() {
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { user } = useAuth();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t, i18n } = useTranslation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [lastUserQuestion, setLastUserQuestion] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const {
    data: popularKeywords,
    isLoading: isKeywordsLoading,
    error,
  } = usePopularKeywords({ size: 5 });

  useEffect(() => {
    console.log("🔍 인기 키워드 로딩:", isKeywordsLoading);
    console.log("🔍 인기 키워드 데이터:", popularKeywords);
    console.log("🔍 인기 키워드 에러:", error);
  }, [popularKeywords, isKeywordsLoading, error]);

  useEffect(() => {
    setMessages([
      {
        id: "1",
        text: t("chat.greeting"),
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  }, [i18n.language, t]);

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
        scheduleTitle: data.scheduleTitle,
        startDate: data.startDate,
        endDate: data.endDate,
        originalQuestion: lastUserQuestion,
      };
      setMessages((prev) => [...prev, botMessage]);
    },

    onError: (error) => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `${t("chat.error")}: ${error.message}`,
        sender: "bot",
        timestamp: new Date(),
        originalQuestion: lastUserQuestion,
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

  const sendMessage = (text?: string) => {
    const messageText = text || inputText;
    if (messageText.trim() === "" || isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLastUserQuestion(messageText);

    sendQuery(messageText);
    setInputText("");
  };

  const handleKeywordPress = async (keyword: string) => {
    if (isPending) return;

    try {
      const latestQuestion = await fetchLatestQuestionByKeyword(keyword);

      if (latestQuestion && latestQuestion.question) {
        sendMessage(latestQuestion.question);
      } else {
        sendMessage(keyword);
      }
    } catch (error) {
      console.error("최신 질문 조회 실패:", error);
      sendMessage(keyword);
    }
  };

  const handleGoToCalendar = (message: Message) => {
    navigation.navigate("Calendar", {
      eventText: message.text,
      scheduleTitle: message.scheduleTitle,
      startDate: message.startDate,
      endDate: message.endDate,
    });
  };

  const handleAskOnBoard = (question: string) => {
    if (!user) {
      Alert.alert(t("auth.loginRequired"), t("auth.loginSubtitle"), [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("auth.login"), onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }

    if (user.role === "guest") {
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
      return;
    }

    navigation.navigate("QuestionWrite", {
      initialTitle: question,
    });
  };

  const renderPopularKeywords = () => {
    if (isKeywordsLoading) return null;
    if (!popularKeywords || popularKeywords.length === 0) return null;

    return (
      <View style={styles.keywordsContainer}>
        <Text style={styles.keywordsTitle}>{t("chat.popularKeywords")}</Text>
        <View style={styles.keywordsColumn}>
          {popularKeywords.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.keywordChip}
              onPress={() => handleKeywordPress(item.keyword)}
              disabled={isPending}
            >
              <Text style={styles.keywordText}>{item.keyword}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user";
    const isGreeting = item.id === "1";

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
              onPress={() => handleGoToCalendar(item)}
            >
              <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
              <Text style={styles.calendarButtonText}>
                {t("chat.addToCalendar")}
              </Text>
            </TouchableOpacity>
          )}

          {!isUser && !isGreeting && item.originalQuestion && (
            <TouchableOpacity
              style={styles.askBoardButton}
              onPress={() => handleAskOnBoard(item.originalQuestion!)}
            >
              <Ionicons name="chatbubbles-outline" size={18} color="#007AFF" />
              <Text style={styles.askBoardButtonText}>
                {t("chat.askOnBoard")}
              </Text>
            </TouchableOpacity>
          )}

          {!isUser && item.sources && item.sources.length > 0 && (
            <View style={styles.sourceContainer}>
              <Text style={styles.sourceTitle}>{t("chat.sources")}:</Text>
              {item.sources.map((source, index) => (
                <TouchableOpacity
                  key={source.docId || index}
                  onPress={() => {
                    if (source.link) Linking.openURL(source.link);
                  }}
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
        ListHeaderComponent={renderPopularKeywords}
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
            placeholderTextColor="#8E8E93"
            multiline
            editable={!isPending}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (inputText.trim() === "" || isPending) &&
                styles.sendButtonDisabled,
            ]}
            onPress={() => sendMessage()}
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
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#007AFF",
    borderRadius: 20,
    gap: 6,
  },
  calendarButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  askBoardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#007AFF",
    gap: 6,
  },
  askBoardButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  keywordsContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  keywordsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 12,
  },
  keywordsColumn: {
    flexDirection: "column",
    gap: 8,
  },
  keywordChip: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  keywordText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
});
