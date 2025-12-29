import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Linking,
  Image,
  Alert,
} from 'react-native';


const PaymentScreen = ({ navigation }) => {
  const [method, setMethod] = useState('card'); // card | upi
  const [cardType, setCardType] = useState('debit'); // credit | debit
  const [selectedCard, setSelectedCard] = useState(null);
  const [cvv, setCvv] = useState('');

  const amount = '150.00'; // Example amount

  const savedCards = [
    {
      id: 1,
      bank: 'Axis Bank',
      number: '**** **** **** 7259',
      expiry: '12/26',
    },
    {
      id: 2,
      bank: 'HDFC Bank',
      number: '**** **** **** 8342',
      expiry: '09/25',
    },
  ];

  const upiApps = [
    { id: 'gpay', name: 'Google Pay', icon: require('../../assets/upi/gpay.png') ,url: `tez://upi/pay`,},
    { id: 'phonepe', name: 'PhonePe', icon: require('../../assets/upi/phonepe.png'), url: `phonepe://upi/pay`,},
    { id: 'paytm', name: 'Paytm', icon: require('../../assets/upi/paytm.png'),url: `paytmmp://upi/pay`, },
    { id: 'amazon', name: 'Amazon Pay', icon: require('../../assets/upi/amazonpay.png'), url: `upi://pay?pa=test@upi&pn=BusTicket&am=${amount}&cu=INR`, },
  ];

  const handlePay = () => {
    if (method === 'card' && !selectedCard) {
      Alert.alert('Select Card', 'Please select a card');
      return;
    }
    if (method === 'card' && cvv.length !== 3) {
      Alert.alert('Invalid CVV', 'Enter a valid CVV');
      return;
    }

    Alert.alert(
      'Payment Initiated',
      'Redirecting to payment confirmation...',
      [
        {
          text: 'OK',
          onPress: () => {
            // navigation.navigate('PaymentSuccess');
            console.log('Navigate to next screen');
            
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Payment</Text>

        {/* MAIN METHOD */}
        <Text style={styles.sectionTitle}>Choose Payment Method</Text>

        <TouchableOpacity
          style={[styles.methodBox, method === 'card' && styles.active]}
          onPress={() => setMethod('card')}
        >
          <Text style={styles.methodText}>💳 Card</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodBox, method === 'upi' && styles.active]}
          onPress={() => setMethod('upi')}
        >
          <Text style={styles.methodText}>📱 UPI</Text>
        </TouchableOpacity>

        {/* CARD SECTION */}
        {method === 'card' && (
          <>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  cardType === 'credit' && styles.activeToggle,
                ]}
                onPress={() => setCardType('credit')}
              >
                <Text>Credit Card</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  cardType === 'debit' && styles.activeToggle,
                ]}
                onPress={() => setCardType('debit')}
              >
                <Text>Debit Card</Text>
              </TouchableOpacity>
            </View>

            {savedCards.map(card => (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.cardBox,
                  selectedCard?.id === card.id && styles.selected,
                ]}
                onPress={() => setSelectedCard(card)}
              >
                <Text style={styles.bank}>{card.bank}</Text>
                <Text>{card.number} | {card.expiry}</Text>

                {selectedCard?.id === card.id && (
                  <TextInput
                    placeholder="CVV"
                    keyboardType="number-pad"
                    maxLength={3}
                    style={styles.cvv}
                    value={cvv}
                    onChangeText={setCvv}
                  />
                )}
              </TouchableOpacity>
            ))}

            {/* ADD NEW CARD */}
            <Text style={styles.sectionTitle}>Add New Card</Text>
            <TextInput placeholder="Card Number" style={styles.input} />
            <TextInput placeholder="MM / YY" style={styles.input} />
            <TextInput placeholder="Cardholder Name" style={styles.input} />
            <TextInput placeholder="CVV" style={styles.input} keyboardType="number-pad" />
          </>
        )}

        {/* UPI SECTION */}
        {method === 'upi' && (
          <View style={styles.upiGrid}>
            {upiApps.map(app => (
              <TouchableOpacity key={app.id} style={styles.upiBox} onPress={() => Linking.openURL(app.url)} >
                <Image source={app.icon} style={styles.upiIcon} />
                <Text>{app.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FIXED PAY BUTTON */}
      <TouchableOpacity style={styles.payButton} onPress={handlePay}>
        <Text style={styles.payText}>Pay Securely</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 180, // IMPORTANT → space for button
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 5,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 14,
  },

  /* PAYMENT METHOD */
  methodBox: {
    backgroundColor: '#f3f3f3',
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
  },

  methodText: {
    fontSize: 16,
    fontWeight: '500',
  },

  active: {
    borderWidth: 2,
    borderColor: '#1e90ff',
    backgroundColor: '#eef6ff',
  },

  /* CREDIT / DEBIT TOGGLE */
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },

  toggleButton: {
    width: '48%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },

  activeToggle: {
    backgroundColor: '#d6ebff',
    borderWidth: 1.5,
    borderColor: '#1e90ff',
  },

  /* SAVED CARD */
  cardBox: {
    backgroundColor: '#f7f7f7',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },

  selected: {
    borderWidth: 2,
    borderColor: '#1e90ff',
  },

  bank: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },

  cvv: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    width: '50%',
  },

  /* INPUTS */
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  /* UPI */
  upiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  upiBox: {
    width: '48%',
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
  },

  upiIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginBottom: 8,
  },

  /* PAY BUTTON */
  payButton: {
    position: 'absolute',
    bottom: 55,
    left: 16,
    right: 16,
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
  },

  payText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});