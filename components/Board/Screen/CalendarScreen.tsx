// src/screens/CalendarScreen.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
  Switch, // 📍 스위치 추가
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker"; // 📍 시간 선택기 추가

import {
  fetchGoogleEvents,
  createGoogleEvent,
} from "@/components/api/services/chatApi"; // 경로 확인 필요
import { GoogleCalendarEvent } from "@/components/api/types/APITypes/googleCalendarTypes"; // 경로 확인 필요

// 한국어 설정 (기존과 동일)
LocaleConfig.locales["kr"] = {
  monthNames: [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ],
  monthNamesShort: [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ],
  dayNames: [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ],
  dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
  today: "오늘",
};
LocaleConfig.defaultLocale = "kr";

export default function CalendarScreen() {
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [eventsMap, setEventsMap] = useState<
    Record<string, GoogleCalendarEvent[]>
  >({});
  const [loading, setLoading] = useState(false);

  // 모달 관련 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // 📍 시간 및 알림 관련 상태 추가
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [enableNotification, setEnableNotification] = useState(false); // 알림 여부

  // 1. 토큰 가져오기 (기존 동일)
  useEffect(() => {
    const getToken = async () => {
      const token = await AsyncStorage.getItem("googleAccessToken");
      if (token) setGoogleToken(token);
    };
    getToken();
  }, []);

  // 2. 데이터 로드 (기존 동일)
  useEffect(() => {
    if (googleToken) {
      loadCalendarData();
    }
  }, [googleToken]);

  const loadCalendarData = async () => {
    if (!googleToken) return;
    setLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      // 앞뒤로 1년치 가져오기 (범위 넉넉하게)
      const events = await fetchGoogleEvents(
        googleToken,
        `${currentYear}-01-01T00:00:00Z`,
        `${currentYear}-12-31T23:59:59Z`
      );

      const newMap: Record<string, GoogleCalendarEvent[]> = {};
      events.forEach((event) => {
        const dateKey = event.start.date || event.start.dateTime?.split("T")[0];
        if (dateKey) {
          if (!newMap[dateKey]) newMap[dateKey] = [];
          newMap[dateKey].push(event);
        }
      });
      setEventsMap(newMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 📍 시간 포맷 헬퍼 함수 (Date -> "14:00")
  const formatTimeForApi = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // 📍 시간 선택 핸들러
  const onChangeStart = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowStartPicker(false);
    if (selectedDate) setStartTime(selectedDate);
  };

  const onChangeEnd = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowEndPicker(false);
    if (selectedDate) setEndTime(selectedDate);
  };

  // 3. 일정 추가 핸들러 (수정됨)
  const handleAddEvent = async () => {
    if (!newTitle.trim()) {
      Alert.alert("알림", "내용을 입력해주세요.");
      return;
    }
    if (!googleToken) {
      Alert.alert("오류", "로그인이 필요합니다.");
      return;
    }

    try {
      setLoading(true);

      // 📍 API 호출 시 시간과 알림 정보 전달
      await createGoogleEvent(googleToken, {
        title: newTitle,
        date: selectedDate,
        startTime: formatTimeForApi(startTime), // "14:00"
        endTime: formatTimeForApi(endTime), // "15:00"
        reminders: enableNotification ? [10] : [], // 알림 켜져있으면 10분전 알림
      });

      Alert.alert("성공", "일정이 등록되었습니다.");

      // 초기화
      setNewTitle("");
      setEnableNotification(false);
      setModalVisible(false);

      // 목록 새로고침
      await loadCalendarData();
    } catch (error) {
      console.error(error);
      Alert.alert("실패", "일정 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 4. 마커 계산 (기존 동일)
  const markedDates = useMemo(() => {
    const marks: any = {};
    Object.keys(eventsMap).forEach((date) => {
      marks[date] = { marked: true, dotColor: "#007AFF" };
    });
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: "#007AFF",
      selectedTextColor: "#FFF",
    };
    return marks;
  }, [eventsMap, selectedDate]);

  const selectedEvents = eventsMap[selectedDate] || [];

  const formatDisplayTime = (isoString?: string) => {
    if (!isoString) return "종일";
    return new Date(isoString).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <Calendar
        style={styles.calendar}
        theme={{
          todayTextColor: "#007AFF",
          arrowColor: "#007AFF",
          textMonthFontWeight: "bold",
          selectedDayBackgroundColor: "#007AFF",
        }}
        monthFormat={"yyyy년 MM월"}
        markedDates={markedDates}
        onDayPress={(day) => setSelectedDate(day.dateString)}
      />

      <View style={styles.listContainer}>
        <Text style={styles.headerTitle}>
          {selectedDate} 일정 ({selectedEvents.length})
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={{ marginTop: 20 }}
          />
        ) : (
          <FlatList
            data={selectedEvents}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 80 }}
            ListEmptyComponent={
              <View style={styles.emptyView}>
                <Text style={styles.emptyText}>일정이 없습니다.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.eventCard}>
                <Text style={styles.timeText}>
                  {formatDisplayTime(item.start.dateTime)}
                </Text>
                <View style={styles.bar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>{item.summary}</Text>
                </View>
              </View>
            )}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          // 모달 열 때 시간 현재 시간으로 초기화
          const now = new Date();
          setStartTime(now);
          const oneHourLater = new Date(now);
          oneHourLater.setHours(now.getHours() + 1);
          setEndTime(oneHourLater);
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* 📍 일정 입력 모달 (UI 수정됨) */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>새 일정 등록</Text>
            <Text style={{ marginBottom: 15, color: "#666" }}>
              날짜: {selectedDate}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="일정 내용을 입력하세요"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            {/* 📍 시간 선택 UI */}
            <View style={styles.timeRow}>
              <TouchableOpacity
                onPress={() => setShowStartPicker(true)}
                style={styles.timeBtn}
              >
                <Text style={styles.timeLabel}>
                  시작: {formatTimeForApi(startTime)}
                </Text>
              </TouchableOpacity>
              <Ionicons name="arrow-forward" size={16} color="#999" />
              <TouchableOpacity
                onPress={() => setShowEndPicker(true)}
                style={styles.timeBtn}
              >
                <Text style={styles.timeLabel}>
                  종료: {formatTimeForApi(endTime)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 📍 알림 스위치 */}
            <View style={styles.switchContainer}>
              <Text style={{ fontSize: 15 }}>10분 전 알림 받기</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={enableNotification ? "#007AFF" : "#f4f3f4"}
                onValueChange={setEnableNotification}
                value={enableNotification}
              />
            </View>

            {/* DateTimePicker (Android/iOS 대응) */}
            {(showStartPicker || (Platform.OS === "ios" && modalVisible)) &&
              Platform.OS === "android" && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={onChangeStart}
                />
              )}

            {/* 안드로이드는 조건부 렌더링, iOS는 모달 안에 커스텀하게 넣어야 함 (여기선 안드로이드 기준 심플 처리) */}
            {showEndPicker && Platform.OS === "android" && (
              <DateTimePicker
                value={endTime}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={onChangeEnd}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#E5E5E5" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#007AFF" }]}
                onPress={handleAddEvent}
              >
                <Text style={{ color: "white" }}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  calendar: { borderBottomWidth: 1, borderColor: "#E5E5E5", paddingBottom: 10 },
  listContainer: { flex: 1, padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  timeText: { fontSize: 13, fontWeight: "600", color: "#007AFF", width: 65 },
  bar: {
    width: 3,
    height: "100%",
    backgroundColor: "#007AFF",
    marginHorizontal: 10,
    borderRadius: 2,
  },
  eventTitle: { fontSize: 15, fontWeight: "600", color: "#333" },
  emptyView: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "#999" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: { flexDirection: "row", gap: 10, width: "100%", marginTop: 20 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },

  // 📍 추가된 스타일
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
    gap: 10,
  },
  timeBtn: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  timeLabel: { fontSize: 14, fontWeight: "600", color: "#333" },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
});
