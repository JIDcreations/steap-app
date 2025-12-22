import useSWR from 'swr'
import { getCurrentUser } from './auth'

export const ME_KEY = 'me'

export default function useMe() {
  const { data, error, isLoading, mutate } = useSWR(ME_KEY, getCurrentUser)

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  }
}
