import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Alert,
} from 'react-native';

export default function FeedbackScreen() {
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [accuracy, setAccuracy] = useState('Yes');
  const [feedback, setFeedback] = useState('');
  const [scaleAnim] = useState(new Animated.Value(1)); // Animation for emoji

  const emojis = ['😞', '😕', '😐', '🙂', '😁'];
  const emojiColors = ['#FFBABA', '#FFD2A6', '#FFF4A3', '#D6F8C1', '#B3FFB3'];

  const handleEmojiPress = (index) => {
    setSelectedEmoji(index);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.4, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = () => {
    if (selectedEmoji === null || feedback.trim() === '') {
      Alert.alert('Incomplete', 'Please select an emoji and write your feedback.');
      return;
    }

    console.log({
      mood: emojis[selectedEmoji],
      accuracy,
      feedback,
    });

    Alert.alert('Thank you!', 'Your feedback has been submitted.');
    setSelectedEmoji(null);
    setAccuracy('Yes');
    setFeedback('');
  };

  const backgroundColor =
    selectedEmoji !== null ? emojiColors[selectedEmoji] : '#fff';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.title}>Share your feedback</Text>

      {/* Emoji Row */}
      <View style={styles.emojiRow}>
        {emojis.map((emoji, index) => (
          <TouchableOpacity key={index} onPress={() => handleEmojiPress(index)}>
            <Animated.Text
              style={[
                styles.emoji,
                selectedEmoji === index && { transform: [{ scale: scaleAnim }] },
              ]}
            >
              {emoji}
            </Animated.Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bus Location Accuracy */}
      <Text style={styles.question}>Bus location accuracy</Text>
      <View style={styles.checkboxRow}>
        <TouchableOpacity
          style={styles.checkboxItem}
          onPress={() => setAccuracy('Yes')}
        >
          <View style={[styles.checkbox, accuracy === 'Yes' && styles.checked]} />
          <Text style={styles.checkboxText}>Yes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxItem}
          onPress={() => setAccuracy('No')}
        >
          <View style={[styles.checkbox, accuracy === 'No' && styles.checked]} />
          <Text style={styles.checkboxText}>No</Text>
        </TouchableOpacity>
      </View>

      {/* Feedback Input */}
      <TextInput
        style={styles.textBox}
        placeholder="Write your feedback..."
        placeholderTextColor="#666"
        multiline
        value={feedback}
        onChangeText={setFeedback}
        maxLength={150}
      />
      <Text style={styles.counter}>{feedback.length}/150</Text>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitBtn,
          (selectedEmoji === null || feedback.trim() === '') && { opacity: 0.6 },
        ]}
        onPress={handleSubmit}
        disabled={selectedEmoji === null || feedback.trim() === ''}
      >
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  emoji: {
    fontSize: 36,
  },
  question: {
    fontSize: 16,
    fontWeight: '500',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 25,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#888',
    marginRight: 8,
    borderRadius: 3,
  },
  checked: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  checkboxText: {
    fontSize: 15,
  },
  textBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    height: 100,
    marginTop: 15,
    padding: 10,
    fontSize: 15,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  counter: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#555',
    marginTop: 5,
  },
  submitBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 25,
    paddingVertical: 12,
    marginTop: 25,
    alignItems: 'center',
    elevation: 4,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});