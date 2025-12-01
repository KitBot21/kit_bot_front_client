import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ChatbotScreen from "../ChatBot/Screen/ChatbotScreen";
import BoardScreen from "../Board/Screen/BoardScreen";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useAuth } from "../contexts/AuthContext";
import { RootStackParamList } from "@/App";
import { useNavigation } from "expo-router";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

const Tab = createMaterialTopTabNavigator();

export function MainTabs() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Tab.Navigator
      screenOptions={{
        swipeEnabled: isAuthenticated,

        tabBarStyle: {
          height: 48,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E5E5",
        },
        tabBarItemStyle: {
          flexDirection: "row",
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "600",
          marginLeft: 6,
          textTransform: "none",
        },
        tabBarIndicatorStyle: {
          backgroundColor: "#007AFF",
          height: 3,
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
      }}
    >
      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{
          tabBarLabel: t("tabs.chatbot"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubble" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Board"
        component={BoardScreen}
        options={{
          tabBarLabel: t("tabs.board"),
          tabBarIcon: ({ color }) => (
            <FontAwesome name="list-alt" size={20} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              navigation.navigate("Login");
            }
          },
        }}
      />
    </Tab.Navigator>
  );
}
