import axios from 'axios';

const base = (import.meta.env.VITE_API_BASE as string | undefined) ?? '/';
export const api = axios.create({ baseURL: base });

export type Project = { id: number; name: string };

