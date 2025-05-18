import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const TIMEOUT = 30000; // 30 seconds timeout

export async function getData(username: string) {
    try {
        const response = await axios.get(`${BACKEND_URL}/analyze/${username}`, {
            timeout: TIMEOUT,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('Request timed out. Please try again.');
            }
            if (error.response?.status === 404) {
                throw new Error('User not found');
            } else if (error.response?.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            } else if (error.response?.status === 502) {
                throw new Error('GitHub API is currently unavailable');
            } else if (error.response?.status === 400) {
                throw new Error('Invalid username format');
            }
            throw new Error(error.response?.data?.error || 'Failed to fetch data');
        }
        throw new Error('Network error. Please check your connection.');
    }
}
