import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function CommonHeader() {
  return (
    <View style={styles.header}>
      {/* 홈 아이콘 */}
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="home" size={24} color="#007AFF" />
      </TouchableOpacity>

      {/* 타이틀 */}
      <Text style={styles.title}>KIT 봇</Text>

      {/* 우측 아이콘들 */}
      <View style={styles.rightIcons}>
        {/* 캘린더 아이콘 */}
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="calendar" size={20} color="#333" />
        </TouchableOpacity>

        {/* 언어 선택 아이콘 */}
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="language" size={20} color="#333" />
        </TouchableOpacity>

        {/* 메뉴 아이콘 */}
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  iconButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#007AFF",
    letterSpacing: 1,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
