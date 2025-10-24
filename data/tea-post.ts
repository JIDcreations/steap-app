// data/tea-post.ts
import useSWRMutation from 'swr/mutation';
import { API_URL } from '../constants/Api';
import mutation from './_mutation';

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
  user: string;            // User _id
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
    (url: string, { arg }: { arg: TeaCreate }) =>
      mutation(url, {
        method: 'POST',
        body: arg,
      })
  );

  return { trigger, data, isMutating, error };
}
