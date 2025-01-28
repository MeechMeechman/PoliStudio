import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

export async function getVolunteers() {
  try {
    const response = await axios.get(`${API_BASE_URL}/volunteers/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    throw error;
  }
}

export async function createVolunteer(volunteerData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/volunteers/`, volunteerData);
    return response.data;
  } catch (error) {
    console.error('Error creating volunteer:', error);
    throw error;
  }
}

export async function deleteVolunteer(id) {
  try {
    await axios.delete(`${API_BASE_URL}/volunteers/${id}`);
  } catch (error) {
    console.error('Error deleting volunteer:', error);
    throw error;
  }
} 