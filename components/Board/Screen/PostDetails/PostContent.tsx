import { PostDetailType } from "@/components/api/types/ComponentTypes/MockType";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PostContentProps {
  post: PostDetailType;
}

export default function PostContent({ post }: PostContentProps) {
  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.authorName}>{post.author}</Text>
            <Text style={styles.postTime}>{post.createdAt}</Text>
          </View>
        </View>
        <View style={styles.viewCount}>
          <Ionicons name="eye-outline" size={16} color="#8E8E93" />
          <Text style={styles.viewText}>{post.views}</Text>
        </View>
      </View>

      <Text style={styles.postTitle}>{post.title}</Text>
      <Text style={styles.postContent}>{post.content}</Text>

      <View style={styles.tagContainer}>
        {post.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: "#F5F5F5",
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  authorName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  postTime: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 2,
  },
  viewCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewText: {
    fontSize: 12,
    color: "#8E8E93",
  },
  postTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    lineHeight: 28,
  },
  postContent: {
    fontSize: 15,
    color: "#333",
    lineHeight: 24,
    marginBottom: 16,
  },
  tagContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
});
