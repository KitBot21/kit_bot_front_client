import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ChatbotScreen from "../ChatBot/Screen/ChatbotScreen";
import BoardScreen from "../Board/Screen/BoardScreen";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const Tab = createMaterialTopTabNavigator();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
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
        name="챗봇"
        component={ChatbotScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubble" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="게시판"
        component={BoardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome name="list-alt" size={20} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
