import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import useMessages from '@/data/messages';

export default function HomeScreen() {
const { data, isLoading, isError } = useMessages(); 

console.log(data);

if (isLoading) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ThemedText type="title">Loading...</ThemedText>
      </View>
    </SafeAreaView>
  );
}



  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ThemedText type="title">Home</ThemedText>
        {data.map((message: any) => (
          <ThemedText key={message._id}>{message.text} </ThemedText>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#ccc',
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
