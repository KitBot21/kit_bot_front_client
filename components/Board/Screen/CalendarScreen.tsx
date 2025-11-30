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
  Switch,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";

import {
  fetchGoogleEvents,
  createGoogleEvent,
} from "@/components/api/services/chatApi";
import { GoogleCalendarEvent } from "@/components/api/types/APITypes/googleCalendarTypes";

export default function CalendarScreen() {
  const { t, i18n } = useTranslation();

  // 언어에 따른 달력 로케일 설정
  useEffect(() => {
    if (i18n.language === "ko") {
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
    } else {
      LocaleConfig.locales["en"] = {
        monthNames: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ],
        monthNamesShort: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        dayNames: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        today: "Today",
      };
      LocaleConfig.defaultLocale = "en";
    }
  }, [i18n.language]);

  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [eventsMap, setEventsMap] = useState<
    Record<string, GoogleCalendarEvent[]>
  >({});
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [enableNotification, setEnableNotification] = useState(false);

  useEffect(() => {
    const getToken = async () => {
      const token = await AsyncStorage.getItem("googleAccessToken");
      if (token) setGoogleToken(token);
    };
    getToken();
  }, []);

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

  const formatTimeForApi = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const onChangeStart = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowStartPicker(false);
    if (selectedDate) setStartTime(selectedDate);
  };

  const onChangeEnd = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowEndPicker(false);
    if (selectedDate) setEndTime(selectedDate);
  };

  const handleAddEvent = async () => {
    if (!newTitle.trim()) {
      Alert.alert(t("common.alert"), t("calendar.enterContent"));
      return;
    }
    if (!googleToken) {
      Alert.alert(t("common.error"), t("auth.loginRequired"));
      return;
    }

    try {
      setLoading(true);

      await createGoogleEvent(googleToken, {
        title: newTitle,
        date: selectedDate,
        startTime: formatTimeForApi(startTime),
        endTime: formatTimeForApi(endTime),
        reminders: enableNotification ? [10] : [],
      });

      Alert.alert(t("common.success"), t("calendar.eventCreated"));

      setNewTitle("");
      setEnableNotification(false);
      setModalVisible(false);

      await loadCalendarData();
    } catch (error) {
      console.error(error);
      Alert.alert(t("common.failed"), t("calendar.eventCreateError"));
    } finally {
      setLoading(false);
    }
  };

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
    if (!isoString) return t("calendar.allDay");
    return new Date(isoString).toLocaleTimeString(
      i18n.language === "ko" ? "ko-KR" : "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  return (
    <View style={styles.container}>
      <Calendar
        key={i18n.language}
        style={styles.calendar}
        theme={{
          todayTextColor: "#007AFF",
          arrowColor: "#007AFF",
          textMonthFontWeight: "bold",
          selectedDayBackgroundColor: "#007AFF",
        }}
        monthFormat={i18n.language === "ko" ? "yyyy년 MM월" : "MMMM yyyy"}
        markedDates={markedDates}
        onDayPress={(day) => setSelectedDate(day.dateString)}
      />

      <View style={styles.listContainer}>
        <Text style={styles.headerTitle}>
          {selectedDate} {t("calendar.events")} ({selectedEvents.length})
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
                <Text style={styles.emptyText}>{t("calendar.noEvents")}</Text>
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

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("calendar.newEvent")}</Text>
            <Text style={{ marginBottom: 15, color: "#666" }}>
              {t("calendar.date")}: {selectedDate}
            </Text>

            <TextInput
              style={styles.input}
              placeholder={t("calendar.eventPlaceholder")}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <View style={styles.timeRow}>
              <TouchableOpacity
                onPress={() => setShowStartPicker(true)}
                style={styles.timeBtn}
              >
                <Text style={styles.timeLabel}>
                  {t("calendar.start")}: {formatTimeForApi(startTime)}
                </Text>
              </TouchableOpacity>
              <Ionicons name="arrow-forward" size={16} color="#999" />
              <TouchableOpacity
                onPress={() => setShowEndPicker(true)}
                style={styles.timeBtn}
              >
                <Text style={styles.timeLabel}>
                  {t("calendar.end")}: {formatTimeForApi(endTime)}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.switchContainer}>
              <Text style={{ fontSize: 15 }}>{t("calendar.reminder")}</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={enableNotification ? "#007AFF" : "#f4f3f4"}
                onValueChange={setEnableNotification}
                value={enableNotification}
              />
            </View>

            {showStartPicker && Platform.OS === "android" && (
              <DateTimePicker
                value={startTime}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={onChangeStart}
              />
            )}

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
                <Text>{t("common.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#007AFF" }]}
                onPress={handleAddEvent}
              >
                <Text style={{ color: "white" }}>{t("common.save")}</Text>
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
