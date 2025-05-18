import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function getData(username: string) {
    try {
        const response = await axios.get(`${BACKEND_URL}/analyze/${username}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('User not found');
            } else if (error.response?.status === 429) {
                throw new Error('GitHub API rate limit exceeded');
            } else if (error.response?.status === 502) {
                throw new Error('GitHub API unavailable');
            }
            throw new Error(error.response?.data?.error || 'Failed to fetch data');
        }
        throw new Error('Network error');
    }
}
