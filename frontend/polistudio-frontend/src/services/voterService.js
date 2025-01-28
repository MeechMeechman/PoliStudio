import axios from 'axios';

// For local dev, our backend is on port 8000
const API_BASE_URL = 'http://127.0.0.1:8000';

export async function getVoters() {
  try {
    const response = await axios.get(`${API_BASE_URL}/voters/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching voters:', error);
    throw error;
  }
}

export async function createVoter(voterData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/voters/`, voterData);
    return response.data;
  } catch (error) {
    console.error('Error creating voter:', error);
    throw error;
  }
}

export async function updateVoter(id, voterData) {
  try {
    const response = await axios.put(`${API_BASE_URL}/voters/${id}`, voterData);
    return response.data;
  } catch (error) {
    console.error('Error updating voter:', error);
    throw error;
  }
}

export async function deleteVoter(id) {
  try {
    await axios.delete(`${API_BASE_URL}/voters/${id}`);
  } catch (error) {
    console.error('Error deleting voter:', error);
    throw error;
  }
} 