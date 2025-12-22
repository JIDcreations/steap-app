import { API_URL } from '@/constants/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useSWRMutation from 'swr/mutation';

const USER_KEY = 'steap:user'

async function patchBio(
  url: string,
  { arg }: { arg: { userId: string; bio: string } }
) {
  const res = await fetch(`${url}/users/${arg.userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bio: arg.bio }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to update bio')
  return data.user
}

export default function useBioUpdate() {
  const { trigger, data, error, isMutating } = useSWRMutation(API_URL, patchBio)

  return {
    trigger: async (userId: string, bio: string) => {
      const updatedUser = await trigger({ userId, bio })
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
      return updatedUser
    },
    data,
    error,
    isMutating,
  }
}
