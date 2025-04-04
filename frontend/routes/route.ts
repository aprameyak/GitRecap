import axios from 'axios';

export async function getData(username: string) {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const response = await axios.get(`${backendUrl}/analyze/${username}`);
    return response.data;
}
