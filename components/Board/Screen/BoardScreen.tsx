import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/App";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Post } from "@/components/api/types/chat_types";
import RenderPost from "./RenderPost";
const DUMMY_POSTS: Post[] = [
  {
    id: "1",
    title: "학교 주변 맛집 추천해주세요",
    content: "점심 먹을 곳을 찾고 있는데 추천 부탁드립니다.",
    author: "홍길동",
    createdAt: "2시간 전",
    commentCount: 12,
    likeCount: 5,
  },
  {
    id: "2",
    title: "중간고사 범위 공유",
    content: "이번 중간고사 범위 정리해봤어요",
    author: "김철수",
    createdAt: "5시간 전",
    commentCount: 24,
    likeCount: 18,
  },
  {
    id: "3",
    title: "동아리 신입 회원 모집합니다",
    content: "코딩 동아리에서 신입 회원을 모집하고 있습니다",
    author: "이영희",
    createdAt: "1일 전",
    commentCount: 8,
    likeCount: 3,
  },
  {
    id: "4",
    title: "도서관 좌석 정보",
    content: "지금 3층이 비어있어요",
    author: "박민수",
    createdAt: "1일 전",
    commentCount: 5,
    likeCount: 10,
  },
  {
    id: "5",
    title: "버스 시간표 변경 안내",
    content: "다음 주부터 버스 시간표가 변경됩니다",
    author: "관리자",
    createdAt: "2일 전",
    commentCount: 15,
    likeCount: 22,
  },
];

export default function BoardScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>게시판</Text>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={DUMMY_POSTS}
        renderItem={({ item }) => <RenderPost item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("QuestionWrite")}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
  listContent: {
    padding: 16,
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  postAuthor: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  postTime: {
    fontSize: 12,
    color: "#8E8E93",
    marginLeft: 8,
  },
  postStats: {
    flexDirection: "row",
    marginLeft: "auto",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#8E8E93",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
