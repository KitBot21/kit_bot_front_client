import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainTabs } from "./components/Tab/MainTab";
import CommonHeader from "./components/Common/CommonHeader";
import QuestionWrite from "./components/Board/Screen/QuestionWrite";
import BoardScreen from "./components/Board/Screen/BoardScreen";
import PostDetail from "./components/Board/Screen/PostDetails/PostDetail";
export type RootStackParamList = {
  MainTabs: undefined;
  QuestionWrite: undefined;
  BoardScreen: undefined;
  PostDetail: { postId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const queryClient = new QueryClient();

function AppLayout() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, flex: 1, backgroundColor: "white" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
        translucent={false}
      ></StatusBar>
      <CommonHeader />
      <View style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabs}></Stack.Screen>
            <Stack.Screen
              name="BoardScreen"
              component={BoardScreen}
            ></Stack.Screen>
            <Stack.Screen
              name="QuestionWrite"
              component={QuestionWrite}
            ></Stack.Screen>
            <Stack.Screen
              name="PostDetail"
              component={PostDetail}
            ></Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </View>
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
