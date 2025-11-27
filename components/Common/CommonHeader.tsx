import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/App";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export default function CommonHeader() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 메뉴 열림/닫힘 상태 관리
  const [isMenuVisible, setMenuVisible] = useState(false);

  const goToHome = () => {
    navigation.navigate("MainTabs");
  };

  // 마이페이지 이동 함수
  const goToMyPage = () => {
    setMenuVisible(false); // 메뉴 닫기
    // 'MyPage'는 실제 RootStackParamList에 정의된 라우트 이름이어야 합니다.
    // 만약 라우트 이름이 다르다면 수정해주세요 (예: 'Profile', 'Mypage' 등)
    navigation.navigate("MyPageScreen");
  };

  return (
    <View style={styles.header}>
      {/* --- 기존 헤더 영역 --- */}
      <TouchableOpacity style={styles.iconButton} onPress={goToHome}>
        <Ionicons name="home" size={24} color="#007AFF" />
      </TouchableOpacity>

      <View style={styles.rightIcons}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate("Calendar")}
        >
          <Ionicons name="calendar" size={20} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="language" size={20} color="#333" />
        </TouchableOpacity>

        {/* 메뉴 버튼: 클릭 시 모달 열기 */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* --- 우측 사이드 메뉴 (Modal) --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={() => setMenuVisible(false)} // 안드로이드 뒤로가기 대응
      >
        {/* 모달 배경 (어두운 부분) - 클릭 시 닫힘 */}
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            {/* 실제 메뉴 영역 (이 부분만 클릭 이벤트 전파 방지) */}
            <TouchableWithoutFeedback>
              <View style={styles.menuContainer}>
                <SafeAreaView>
                  {/* 메뉴 상단: 닫기 버튼 */}
                  <View style={styles.menuHeader}>
                    <Text style={styles.menuTitle}>Menu</Text>
                    <TouchableOpacity onPress={() => setMenuVisible(false)}>
                      <Ionicons name="close" size={28} color="#333" />
                    </TouchableOpacity>
                  </View>

                  {/* 메뉴 리스트 */}
                  <View style={styles.menuItems}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={goToMyPage}
                    >
                      <Ionicons
                        name="person-circle-outline"
                        size={24}
                        color="#333"
                      />
                      <Text style={styles.menuText}>마이페이지</Text>
                    </TouchableOpacity>

                    {/* 추가 메뉴 예시 */}
                    <TouchableOpacity style={styles.menuItem}>
                      <Ionicons
                        name="settings-outline"
                        size={24}
                        color="#333"
                      />
                      <Text style={styles.menuText}>설정</Text>
                    </TouchableOpacity>
                  </View>
                </SafeAreaView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  // --- 모달 스타일 추가 ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // 반투명 검은 배경
    flexDirection: "row",
    justifyContent: "flex-end", // 메뉴를 오른쪽으로 정렬
  },
  menuContainer: {
    width: "70%", // 화면 너비의 70% 차지
    backgroundColor: "#FFFFFF",
    height: "100%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingTop: 10,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  menuItems: {
    gap: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});
