import axios from 'axios';
import apiClient from './apiClient';

const API_BASE_URL = 'http://127.0.0.1:8000';

export async function getVolunteers() {
  try {
    const response = await apiClient.get('/volunteers/');
    return response.data;
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    throw error;
  }
}

export async function createVolunteer(volunteerData) {
  try {
    const response = await apiClient.post('/volunteers/', volunteerData);
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
    await apiClient.delete(`/volunteers/${id}`);
  } catch (error) {
    console.error('Error deleting volunteer:', error);
    throw error;
  }
}

export async function getVolunteer(id) {
  try {
    const response = await apiClient.get(`/volunteers/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch volunteer');
  }
}

export async function createOrUpdateVolunteer(formData) {
  try {
    const response = await apiClient.post('/volunteers/create-or-update', formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to create or update volunteer');
  }
} 