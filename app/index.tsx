import { ThemedText } from '@/components/themed-text';
import useMessages from '@/data/messages';
import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


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
        <ThemedText type="title" darkColor='black'>Home</ThemedText>
        <Link href="/details">View details</Link>
        {data.map((message: any) => (
          <ThemedText key={message._id}>{message.text} </ThemedText>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#ffffffff',
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
