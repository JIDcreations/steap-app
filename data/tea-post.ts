// data/tea-post.ts
import useSWRMutation from 'swr/mutation';
import { API_URL } from '../constants/Api';
import mutation from './_mutation';
import { getCurrentUser } from './auth';

type Mood = 'calming' | 'energizing' | 'cozy' | 'focus';

export type TeaCreate = {
  name: string;
  type: string;            // TeaType _id
  steepTime: number;       // minutes
  rating?: number;         // 1..5
  note?: string;
  color?: string;          // one of your 5 hex values
  moodTag?: Mood;
  public?: boolean;
  // vroeger: user: string;  // User _id
  // user is niet meer nodig in de UI, we halen de userId uit AsyncStorage
  user?: string;
};

export type TeaResponse = {
  _id: string;
  name: string;
  type: string | { _id: string; name: string };
  rating?: number;
  note?: string;
  moodTag?: Mood;
  user: string | { _id: string; username: string };
  createdAt: string;
  updatedAt?: string;
};

export default function useTeaPost() {
  const { trigger, data, error, isMutating } = useSWRMutation<
    TeaResponse,            // data returned by API
    any,                    // error type
    string,                 // key type
    TeaCreate               // arg type passed to trigger(...)
  >(
    `${API_URL}/teas`,
    async (url: string, { arg }: { arg: TeaCreate }) => {
      // haal de ingelogde user op uit AsyncStorage
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Not logged in');
      }

      const payload = {
        ...arg,
        // backend verwacht userId in body
        userId: user.id || user._id,
      };

      return mutation(url, {
        method: 'POST',
        body: payload,
      });
    }
  );

  return { trigger, data, isMutating, error };
}
