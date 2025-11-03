// components/Tab/MainTabs.tsx
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ChatbotScreen from "../ChatBot/Screen/ChatbotScreen";
import BoardScreen from "../Board/Screen/BoardScreen";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
const Tab = createMaterialTopTabNavigator();

export function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="챗봇"
        component={ChatbotScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubble" size={20} color={"gray"} />
          ),
        }}
      />
      <Tab.Screen
        name="게시판"
        component={BoardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome name="list-alt" size={20} color={"gray"} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
