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

  recipe?: {
    ingredients?: string[];
    waterMl?: number;
    tempC?: number;
    amount?: string;
    steps?: string;
  };

  color?: string;          // one of your hex values
  moodTag?: Mood;
  public?: boolean;
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
    TeaResponse,
    any,
    string,
    TeaCreate
  >(
    `${API_URL}/teas`,
    async (url: string, { arg }: { arg: TeaCreate }) => {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Not logged in');
      }

      const payload = {
        ...arg,
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
