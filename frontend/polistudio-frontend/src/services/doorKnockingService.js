import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

export async function getTurfs() {
  try {
    const response = await axios.get(`${API_BASE_URL}/door-knocking/turf`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createTurf(turfData) {
  // turfData should include a name and a boundary (JSON string)
  try {
    const response = await axios.post(`${API_BASE_URL}/door-knocking/turf`, turfData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getTurfVoters(turfId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/door-knocking/turf/${turfId}/voters`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function assignTurfToVolunteer(volunteerId, turfId) {
  try {
    const formData = new FormData();
    formData.append('turf_id', turfId);
    const response = await axios.post(`${API_BASE_URL}/door-knocking/volunteers/${volunteerId}/assign-turf`, formData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getVolunteerProgress(volunteerId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/door-knocking/volunteers/${volunteerId}/progress`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getVolunteers() {
  try {
    const response = await axios.get(`${API_BASE_URL}/volunteers/`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function logCanvassingInteraction(logData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/door-knocking/canvassing-log`, logData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getTurfProgress(turfId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/door-knocking/turf/${turfId}/progress`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteTurf(turfId) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/door-knocking/turf/${turfId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
} 