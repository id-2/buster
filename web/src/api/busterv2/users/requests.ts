import { BASE_URL } from '@/api/buster/instances';
import { BusterUserResponse } from './interfaces';

export const getUserInfo = async ({
  jwtToken
}: {
  jwtToken: string | undefined;
}): Promise<BusterUserResponse | undefined> => {
  return fetch(`${BASE_URL}/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`
    }
  })
    .then((response) => {
      return response.json();
    })
    .catch((error) => {
      return undefined;
    });
};
