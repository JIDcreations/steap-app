// data/bio-update.ts
import { API_URL } from '@/constants/Api';
import useSWRMutation from 'swr/mutation';

export type UpdateProfilePayload = {
  bio?: string;
  avatarColor?: string;
};

async function patchProfile(
  url: string,
  { arg }: { arg: { userId: string; data: UpdateProfilePayload } }
) {
  const res = await fetch(`${url}/users/${arg.userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg.data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'Failed to update profile');

  return json.user;
}

export default function useBioUpdate() {
  const { trigger, data, error, isMutating } = useSWRMutation(API_URL, patchProfile);

  return {
    trigger: (userId: string, data: UpdateProfilePayload) => trigger({ userId, data }),
    data,
    error,
    isMutating,
  };
}
