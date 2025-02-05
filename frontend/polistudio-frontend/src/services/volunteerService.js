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
    if (response.data.message) {
      alert(response.data.message);
    }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to create volunteer');
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

export async function getVolunteer(id) {
  try {
    const response = await axios.get(`${API_BASE_URL}/volunteers/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch volunteer');
  }
}

export async function createOrUpdateVolunteer(formData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/volunteers/create-or-update`, formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to create or update volunteer');
  }
} 