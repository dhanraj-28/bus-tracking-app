import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

export default function MenuScreen({ navigation }) {
  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.headerRow}>
        <Ionicons name="arrow-back" size={26} onPress={() => navigation.goBack()} />
        <Text style={styles.headerText}>MENU</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.profileCard}>
        <FontAwesome5 name="user" size={22} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.profileName}>Harini B</Text>
          <Text style={styles.profileNumber}>9677659119</Text>
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.optionsCard}>

        <MenuItem
          icon={<MaterialIcons name="language" size={22} />}
          label="Change Language"
          onPress={() => navigation.navigate("ChangeLanguageScreen")}
        />

        <MenuItem
          icon={<FontAwesome5 name="exclamation-circle" size={22} />}
          label="SOS"
          onPress={() => navigation.navigate("SOSScreen")}
        />

        <MenuItem
          icon={<Ionicons name="notifications-outline" size={22} />}
          label="Notification"
          onPress={() => navigation.navigate("NotificationScreen")}
        />

        <MenuItem
          icon={<FontAwesome5 name="paypal" size={22} />}
          label="Payments"
          onPress={() => navigation.navigate("PaymentsScreen")}
        />

        <MenuItem
          icon={<Ionicons name="log-out-outline" size={22} />}
          label="Logout"
          onPress={() => navigation.navigate("LogoutScreen")}
        />

      </View>

    </View>
  );
}

/* ========== Menu Item Component ========== */
const MenuItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    {icon}
    <Text style={styles.menuLabel}>{label}</Text>
  </TouchableOpacity>
);

/* ========== CSS / STYLES ========== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    padding: 20,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  headerText: {
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 10,
  },

  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 25,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 4,
  },

  profileName: {
    fontSize: 18,
    fontWeight: '600',
  },

  profileNumber: {
    fontSize: 14,
    color: 'gray',
    marginTop: 3,
  },

  optionsCard: {
    backgroundColor: '#fff',
    marginTop: 25,
    borderRadius: 20,
    elevation: 4,
    overflow: 'hidden',
  },

  menuItem: {
    flexDirection: 'row',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    alignItems: 'center',
  },

  menuLabel: {
    fontSize: 16,
    marginLeft: 15,
    fontWeight: '500',
  },
});


