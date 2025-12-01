import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/App";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useUnreadNotificationCount } from "../hooks/useNotification";
import { useTranslation } from "react-i18next";
import { setStoredLanguage } from "../i18n";
import {
  useSafeAreaInsets,
  initialWindowMetrics,
} from "react-native-safe-area-context";

export default function CommonHeader() {
  const insets = initialWindowMetrics?.insets ?? { top: 0, bottom: 0 };
  console.log(initialWindowMetrics);
  console.log(insets);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t, i18n } = useTranslation();

  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);
  const { data: unreadCount } = useUnreadNotificationCount();

  const goToHome = () => {
    navigation.navigate("MainTabs");
  };

  const goToMyPage = () => {
    setMenuVisible(false);
    navigation.navigate("MyPageScreen");
  };

  const goToNotifications = () => {
    navigation.navigate("Notifications");
  };

  const changeLanguage = (lang: string) => {
    setStoredLanguage(lang);
    setLanguageModalVisible(false);
  };

  return (
    <View style={styles.header}>
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

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setLanguageModalVisible(true)}
        >
          <Ionicons name="language" size={20} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={goToNotifications}>
          <Ionicons name="notifications-outline" size={20} color="#333" />
          {!!unreadCount && unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount.toString()}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* 언어 선택 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isLanguageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback
          onPress={() => setLanguageModalVisible(false)}
        >
          <View style={styles.languageModalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.languageModal}>
                <Text style={styles.languageTitle}>
                  {t("header.selectLanguage")}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    i18n.language === "ko" && styles.languageOptionActive,
                  ]}
                  onPress={() => changeLanguage("ko")}
                >
                  <Text
                    style={[
                      styles.languageText,
                      i18n.language === "ko" && styles.languageTextActive,
                    ]}
                  >
                    {t("header.korean")}
                  </Text>
                  {i18n.language === "ko" && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    i18n.language === "en" && styles.languageOptionActive,
                  ]}
                  onPress={() => changeLanguage("en")}
                >
                  <Text
                    style={[
                      styles.languageText,
                      i18n.language === "en" && styles.languageTextActive,
                    ]}
                  >
                    {t("header.english")}
                  </Text>
                  {i18n.language === "en" && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 메뉴 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={() => setMenuVisible(false)}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuModalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.menuContainer,
                  {
                    paddingTop: insets.top + 20,
                    paddingBottom: insets.bottom + 20,
                  },
                ]}
              >
                <View style={styles.menuHeader}>
                  <Text style={styles.menuTitle}>{t("header.menu")}</Text>
                  <TouchableOpacity onPress={() => setMenuVisible(false)}>
                    <Ionicons name="close" size={28} color="#333" />
                  </TouchableOpacity>
                </View>

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
                    <Text style={styles.menuText}>{t("header.mypage")}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="settings-outline" size={24} color="#333" />
                    <Text style={styles.menuText}>{t("header.settings")}</Text>
                  </TouchableOpacity>
                </View>
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
  menuModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  languageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    width: "70%",
    backgroundColor: "#FFFFFF",
    height: "100%", // 👈 flex: 1 대신
    paddingHorizontal: 20,
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
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  languageModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  languageTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  languageOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  languageOptionActive: {
    backgroundColor: "#F0F8FF",
  },
  languageText: {
    fontSize: 16,
    color: "#333",
  },
  languageTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
