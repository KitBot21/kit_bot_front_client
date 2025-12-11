import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CommonHeader from "./components/Common/CommonHeader";
import QuestionWrite from "./components/Board/Screen/QuestionWrite";
import PostDetail from "./components/Board/Screen/PostDetails/PostDetail";
import QuestionEdit from "./components/Board/Screen/QuestionEditor";
import { AuthProvider, useAuth } from "./components/contexts/AuthContext";
import LoginScreen from "./components/auth/LoginScreen";
import SetUsernameScreen from "./components/auth/SetUserNameScreen";
import { MainTabs } from "./components/Tab/MainTab";
import MyPageScreen from "./components/MyPage/Screen/MyPage";
import CalendarScreen from "./components/Board/Screen/CalendarScreen";
import SchoolAuthScreen from "./components/auth/SchoolAuthScreen";
import { useUpdatePushToken } from "./components/hooks/useUserMutation";
import { useEffect, useRef } from "react";
import { usePushNotification } from "./components/hooks/usePushNotification";
import { KeyboardProvider } from "react-native-keyboard-controller";
import NotificationsScreen from "./components/Notifications/Screen/NotificationsScreen";
import "./components/i18n";
import EditNicknameScreen from "./components/MyPage/Screen/EditNicknameScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { queryClient } from "@/components/lib/queryClient";
import { ActivityIndicator, View } from "react-native";

export type RootStackParamList = {
  MainTabs: undefined;
  QuestionWrite: { initialTitle?: string } | undefined;
  Login: undefined;
  SetUsername: undefined;
  BoardScreen: undefined;
  PostDetail: { postId: string };
  QuestionEdit: { postId: string };
  MyPageScreen: undefined;
  Calendar:
    | {
        eventText?: string;
        scheduleTitle?: string;
        startDate?: string;
        endDate?: string;
      }
    | undefined;
  SchoolAuth: undefined;
  Notifications: undefined;
  EditNickname: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppLayout() {
  const navigationRef = useRef<any>(null);
  const { user, isLoading, isAuthenticated, isProfileComplete } = useAuth();
  const { expoPushToken, notificationResponse } = usePushNotification();
  const { mutate: saveToken } = useUpdatePushToken();

  useEffect(() => {
    if (notificationResponse && navigationRef.current) {
      navigationRef.current.navigate("Notifications");
    }
  }, [notificationResponse]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // 로그인 했는데 닉네임 없으면 → 닉네임 설정 강제
  const needsUsername = isAuthenticated && !isProfileComplete;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
        translucent={false}
      />
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ header: () => <CommonHeader /> }}>
          {needsUsername ? (
            <Stack.Screen
              name="SetUsername"
              component={SetUsernameScreen}
              options={{ headerShown: false }}
            />
          ) : (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="QuestionWrite" component={QuestionWrite} />
              <Stack.Screen name="PostDetail" component={PostDetail} />
              <Stack.Screen
                name="QuestionEdit"
                component={QuestionEdit}
                options={{ headerShown: false }}
              />
              <Stack.Screen name="MyPageScreen" component={MyPageScreen} />
              <Stack.Screen name="Calendar" component={CalendarScreen} />
              <Stack.Screen name="SchoolAuth" component={SchoolAuthScreen} />
              <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
              />
              <Stack.Screen
                name="EditNickname"
                component={EditNicknameScreen}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <AppLayout />
            </AuthProvider>
          </QueryClientProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
