import axios from 'axios';

export async function getData(username: string) {
    const data = axios.get('http://localhost:5000/analyze?<username>');
    return data;
}
