export const API_BASE_URL = 'https://fotocopy-backend.onrender.com';

export const apiUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
