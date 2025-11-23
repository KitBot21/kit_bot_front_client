import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CommonHeader from "./components/Common/CommonHeader";
import QuestionWrite from "./components/Board/Screen/QuestionWrite";
import BoardScreen from "./components/Board/Screen/BoardScreen";
import PostDetail from "./components/Board/Screen/PostDetails/PostDetail";
import QuestionEdit from "./components/Board/Screen/QuestionEditor";
import { AuthProvider } from "./components/contexts/AuthContext";
import LoginScreen from "./components/auth/LoginScreen";
import SetUsernameScreen from "./components/auth/SetUserNameScreen";
import { MainTabs } from "./components/Tab/MainTab";

export type RootStackParamList = {
  MainTabs: undefined;
  QuestionWrite: undefined;
  Login: undefined; // 추가
  SetUsername: undefined; // 추가
  BoardScreen: undefined;
  PostDetail: { postId: string };
  QuestionEdit: { postId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const queryClient = new QueryClient();

function AppLayout() {
  const insets = useSafeAreaInsets();
  return (
    <AuthProvider>
      <View
        style={{
          paddingTop: insets.top,
          flex: 1,
          backgroundColor: "white",
          paddingBottom: insets.bottom,
        }}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#ffffff"
          translucent={false}
        />
        <View style={{ flex: 1 }}>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ header: () => <CommonHeader /> }}>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="SetUsername" component={SetUsernameScreen} />
              <Stack.Screen name="QuestionWrite" component={QuestionWrite} />
              <Stack.Screen name="PostDetail" component={PostDetail} />
              <Stack.Screen
                name="QuestionEdit"
                component={QuestionEdit}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      </View>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppLayout />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
