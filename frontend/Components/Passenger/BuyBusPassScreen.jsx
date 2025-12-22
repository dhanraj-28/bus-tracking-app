import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';

const BuyBusPassScreen = ({ navigation }) => {
  const [timePeriod, setTimePeriod] = useState('1 DAY');
  const [passType, setPassType] = useState('Student');
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const timeOptions = ['1 DAY', '1 MONTH', '3 MONTH', '6 MONTH', '1 YEAR'];
  const passOptions = ['General Pass', 'Student', 'Senior Citizen', 'Disabled'];

  // 🔹 Calculate Valid Till Date
  const validTillDate = useMemo(() => {
    const base = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );

    switch (timePeriod) {
      case '1 DAY':
        base.setDate(base.getDate() + 1);
        break;
      case '1 MONTH':
        base.setMonth(base.getMonth() + 1);
        break;
      case '3 MONTH':
        base.setMonth(base.getMonth() + 3);
        break;
      case '6 MONTH':
        base.setMonth(base.getMonth() + 6);
        break;
      case '1 YEAR':
        base.setFullYear(base.getFullYear() + 1);
        break;
      default:
        break;
    }

    return base;
  }, [startDate, timePeriod]);

  const formatDate = (date) =>
    date.toLocaleDateString('en-GB'); // dd/mm/yyyy

  // 📅 Date Picker Handler (SAFE)
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);

    // Android cancel press safety
    if (event?.type === 'dismissed') {
      return;
    }

    if (selectedDate) {
      setStartDate(selectedDate); // keep Date object
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}
    showsVerticalScrollIndicator={false}
  >
    <View style={styles.container}>
      <Text style={styles.header}>Buy Bus Pass</Text>

      {/* Time Period */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>SELECT TIME PERIOD</Text>

        {timeOptions.map((item) => (
          <Pressable
            key={item}
            style={styles.radioRow}
            onPress={() => setTimePeriod(item)}
          >
            <View style={styles.radioOuter}>
              {timePeriod === item && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      {/* Start Date */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>SELECT START DATE</Text>

        {Platform.OS === 'web' ? (
          <input
            type="date"
            value={startDate.toISOString().split('T')[0]}
            onChange={(e) => setStartDate(new Date(e.target.value))}
            style={styles.webDate}
          />
        ) : (
          <>
            <View style={styles.dateRow}>
              <Text style={styles.dateText}>{formatDate(startDate)}</Text>

              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <MaterialIcons
                  name="date-range"
                  size={26}
                  color="#4F46E5"
                />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}
          </>
        )}

        <Text style={styles.validText}>VALID TILL:</Text>
        <Text style={styles.validDate}>{formatDate(validTillDate)}</Text>
      </View>

      {/* Pass Type */}
      <Text style={styles.sectionTitle}>Select Pass</Text>

      {passOptions.map((item) => (
        <Pressable
          key={item}
          style={styles.passCard}
          onPress={() => setPassType(item)}
        >
          <View style={styles.radioOuter}>
            {passType === item && <View style={styles.radioInner} />}
          </View>
          <Text style={styles.passText}>{item}</Text>
          <Text style={styles.selectText}>Select pass</Text>
        </Pressable>
      ))}

      {/* Next Button */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() =>
          navigation.navigate('Payment', {
            timePeriod,
            passType,
            startDate: startDate.toISOString(),
            validTillDate: validTillDate.toISOString(),
          })
        }
      >
        <Text style={styles.nextText}>NEXT</Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
  );
};

export default BuyBusPassScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F4F4F4',
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4F46E5',
  },
  radioText: {
    fontSize: 14,
  },
  webDate: {
    padding: 8,
    fontSize: 14,
    borderRadius: 6,
    border: '1px solid #ccc',
    width: '60%',
  },
  validText: {
    fontSize: 11,
    marginTop: 6,
  },
  validDate: {
    color: 'red',
    fontSize: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  passCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  passText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  selectText: {
    fontSize: 12,
    color: '#666',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 46,
    borderRadius: 6,
    width: '60%',
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 14,
    color: '#000',
  },
  nextButton: {
    backgroundColor: '#4F46E5',
    padding: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  nextText: {
    color: '#fff',
    fontWeight: '600',
  },
});
