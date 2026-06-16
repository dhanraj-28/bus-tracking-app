import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { auth } from "../../src/config/firebase";
import {
  subscribePaymentHistory,
  applyPaymentFilters,
  groupPaymentsByMonth,
  getFilterOptions,
} from "../../src/controllers/paymentHistoryController";
import { LanguageContext, translations } from "../../context/LanguageContext";

const EMPTY_FILTERS = {
  status: [],
  paymentMethod: [],
  amount: [],
  filterDate: null,
  search: "",
};

const AVATAR_COLORS = ["#5E60CE", "#4EA8DE", "#72EFDD", "#F72585", "#FFB703"];

function formatCalendarDate(date) {
  if (!date) return "Select date";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function cloneFilters(f) {
  return {
    ...f,
    filterDate: f.filterDate ? new Date(f.filterDate) : null,
  };
}

export default function PaymentHistoryScreen({ navigation }) {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      Alert.alert("Login required", "Please log in to view payment history.");
      return undefined;
    }

    const unsubscribe = subscribePaymentHistory(
      user.uid,
      (payments) => {
        setAllPayments(payments);
        setLoading(false);
      },
      (error) => {
        console.log(error);
        setLoading(false);
        Alert.alert("Error", "Could not load payment history from Firebase.");
      }
    );

    return () => unsubscribe();
  }, []);

  const activeFilters = useMemo(
    () => ({ ...filters, search: searchText }),
    [filters, searchText]
  );

  const filteredPayments = useMemo(
    () => applyPaymentFilters(allPayments, activeFilters),
    [allPayments, activeFilters]
  );

  const grouped = useMemo(
    () => groupPaymentsByMonth(filteredPayments),
    [filteredPayments]
  );

  const filterOptions = useMemo(
    () => getFilterOptions(allPayments),
    [allPayments]
  );

  const flatData = useMemo(() => {
    const rows = [];
    grouped.forEach(({ month, items }) => {
      rows.push({ type: "header", month, id: `h-${month}` });
      items.forEach((item) => rows.push({ type: "item", ...item }));
    });
    return rows;
  }, [grouped]);

  const toggleDraft = (key, value) => {
    setDraftFilters((prev) => {
      const list = prev[key] || [];
      const exists = list.includes(value);
      return {
        ...prev,
        [key]: exists ? list.filter((v) => v !== value) : [...list, value],
      };
    });
  };

  const applyFilters = () => {
    setShowDatePicker(false);
    setFilters({ ...draftFilters, search: searchText });
    setFilterVisible(false);
  };

  const clearFilters = () => {
    setDraftFilters({ ...EMPTY_FILTERS });
    setFilters({ ...EMPTY_FILTERS });
    setSearchText("");
    setShowDatePicker(false);
  };

  const onDatePicked = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (event?.type === "dismissed") return;
    }
    if (!selectedDate) return;
    setDraftFilters((prev) => ({
      ...prev,
      filterDate: selectedDate,
    }));
  };

  const activeFilterCount =
    filters.status.length +
    filters.paymentMethod.length +
    filters.amount.length +
    (filters.filterDate ? 1 : 0);

  const renderChipSection = (title, key, options) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>{title}</Text>
      <View style={styles.chipRow}>
        {options.map((opt) => {
          const selected = draftFilters[key]?.includes(opt);
          return (
            <TouchableOpacity
              key={`${key}-${opt}`}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => toggleDraft(key, opt)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderItem = ({ item, index }) => {
    if (item.type === "header") {
      return (
        <View style={styles.monthHeader}>
          <Text style={styles.monthHeaderText}>{item.month}</Text>
        </View>
      );
    }

    const amountPrefix = item.isCredit ? "+ " : "- ";
    const amountColor = item.isCredit ? "#1B8A3E" : "#111";
    const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

    return (
      <TouchableOpacity
        style={styles.txCard}
        onPress={() =>
          navigation.navigate("PaymentDetailScreen", {
            paymentId: item.id,
            payment: item,
          })
        }
      >
        <View style={[styles.txAvatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.txAvatarText}>{item.avatarLetter}</Text>
        </View>

        <View style={styles.txBody}>
          <Text style={styles.txTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.txDate}>{item.paidAtLabel}</Text>
          <View style={styles.sourceRow}>
            <MaterialCommunityIcons name="bank" size={12} color="#888" />
            <Text style={styles.txSource}>{item.sourceLabel}</Text>
          </View>
        </View>

        <View style={styles.txRight}>
          <Text style={[styles.txAmount, { color: amountColor }]}>
            {amountPrefix}₹ {item.amount}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Balance & History</Text>
          <Text style={styles.headerSub}>
            {t.paymentHistory || "Payment History"}
          </Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search or filter payments"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => {
            setDraftFilters(cloneFilters(filters));
            setFilterVisible(true);
          }}
        >
          <Ionicons name="options" size={22} color="#fff" />
          {activeFilterCount > 0 ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#5E60CE" />
          <Text style={styles.loadingText}>Loading from Firebase...</Text>
        </View>
      ) : (
        <FlatList
          data={flatData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No payments found. Make sure you are logged in and payments exist
              in Firebase for your userId.
            </Text>
          }
        />
      )}

      <Modal visible={filterVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Payments</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowDatePicker(false);
                  setFilterVisible(false);
                }}
              >
                <Ionicons name="close-circle" size={30} color="#555" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {renderChipSection("Status", "status", filterOptions.status)}
              {renderChipSection(
                "Payment method",
                "paymentMethod",
                filterOptions.paymentMethod
              )}
              {renderChipSection("Amount", "amount", filterOptions.amount)}

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Date</Text>
                <TouchableOpacity
                  style={styles.datePickerBtn}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={22} color="#5E60CE" />
                  <View style={styles.datePickerTextWrap}>
                    <Text style={styles.datePickerValue}>
                      {formatCalendarDate(draftFilters.filterDate)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#888" />
                </TouchableOpacity>
                {draftFilters.filterDate ? (
                  <TouchableOpacity
                    onPress={() =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        filterDate: null,
                      }))
                    }
                  >
                    <Text style={styles.clearDateText}>Clear date</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {showDatePicker ? (
                <DateTimePicker
                  value={draftFilters.filterDate || new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={onDatePicked}
                  maximumDate={new Date()}
                />
              ) : null}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
                <Text style={styles.clearBtnText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", marginLeft: 12 },
  headerSub: { fontSize: 13, color: "#666", marginLeft: 12, marginTop: 2 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F8",
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 46,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: "#222" },
  filterBtn: {
    marginLeft: 12,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#5E60CE",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#F72585",
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  listContent: { paddingBottom: 30 },
  monthHeader: {
    backgroundColor: "#EEF0FB",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  monthHeaderText: { fontWeight: "600", color: "#333", fontSize: 14 },
  txCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  txAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  txAvatarText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  txBody: { flex: 1, marginLeft: 14 },
  txTitle: { fontSize: 16, fontWeight: "600", color: "#111" },
  txDate: { fontSize: 13, color: "#888", marginTop: 3 },
  sourceRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  txSource: { fontSize: 12, color: "#888", marginLeft: 4 },
  txRight: { alignItems: "flex-end", minWidth: 80 },
  txAmount: { fontSize: 16, fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 10, color: "#666" },
  emptyText: {
    textAlign: "center",
    marginTop: 48,
    color: "#888",
    fontSize: 15,
    paddingHorizontal: 28,
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: "88%",
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  modalTitle: { fontSize: 22, fontWeight: "700" },
  filterSection: { paddingHorizontal: 22, paddingTop: 18 },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    borderWidth: 1,
    borderColor: "#D8D8D8",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#FAFAFA",
  },
  chipSelected: { backgroundColor: "#5E60CE", borderColor: "#5E60CE" },
  chipText: { fontSize: 14, color: "#333" },
  chipTextSelected: { color: "#fff", fontWeight: "600" },
  datePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D8D8D8",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#FAFAFA",
    marginBottom: 8,
  },
  datePickerTextWrap: { marginLeft: 12, flex: 1 },
  datePickerValue: { fontSize: 16, fontWeight: "600", color: "#222" },
  clearDateText: {
    color: "#5E60CE",
    fontWeight: "600",
    fontSize: 14,
    marginTop: 4,
  },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: 22,
    paddingTop: 22,
  },
  clearBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#5E60CE",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginRight: 10,
  },
  clearBtnText: { color: "#5E60CE", fontWeight: "700", fontSize: 16 },
  applyBtn: {
    flex: 1,
    backgroundColor: "#5E60CE",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  applyBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
