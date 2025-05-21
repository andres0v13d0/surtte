import { getIdToken } from 'firebase/auth';
import { auth } from '../config/firebase';

export const secureFetch = async (url, options = {}) => {
    const user = auth.currentUser;

    if (!user) throw new Error('Usuario no autenticado');

    const token = await getIdToken(user, true);

    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    return fetch(url, {
        ...options,
        headers,
    });
};
