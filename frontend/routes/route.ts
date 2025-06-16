import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const TIMEOUT = 30000; // 30 seconds timeout

export async function getData(username: string) {
    try {
        const response = await axios.get(`${BACKEND_URL}/analyze/${username}`, {
            timeout: TIMEOUT,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('API Error:', error.response?.status, error.response?.data);
            if (error.code === 'ECONNABORTED') {
                throw new Error('Analysis is taking longer than expected. This user might have a lot of repositories. Please try again or try a different user.');
            }
            if (error.response?.status === 404) {
                throw new Error('GitHub user not found. Please check the username and try again.');
            } else if (error.response?.status === 429) {
                throw new Error('GitHub API rate limit reached. Please wait a few minutes and try again.');
            } else if (error.response?.status === 502) {
                throw new Error('GitHub API is currently unavailable. Please try again in a few minutes.');
            } else if (error.response?.status === 400) {
                throw new Error('Invalid username format. Please enter a valid GitHub username.');
            } else if (error.response?.status === 500) {
                throw new Error('Server error occurred while analyzing the profile. Please try again.');
            }
            
            // More specific error messages
            const errorMessage = error.response?.data?.error;
            if (errorMessage?.includes('No public repositories')) {
                throw new Error('This user has no public repositories to analyze. Try a different user.');
            }
            
            throw new Error(errorMessage || 'Failed to analyze GitHub profile. Please try again.');
        }
        
        // Network errors
        if (error instanceof Error && error.message?.includes('Network Error')) {
            throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
        }
        
        throw new Error('An unexpected error occurred. Please try again.');
    }
}
