import apiClient from './apiClient';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  // Return an empty object if no token exists to avoid sending malformed headers
  if (!token) {
    console.warn('No auth token found in localStorage');
    return {};
  }
  return {
    'Authorization': `Bearer ${token}`
  };
};

export async function getTurfs() {
  try {
    const response = await apiClient.get('/door-knocking/turf');
    return response.data;
  } catch (error) {
    console.error('Error fetching turfs:', error);
    return [];
  }
}

export async function createTurf(turfData) {
  // turfData should include a name and a boundary (JSON string)
  try {
    const response = await apiClient.post('/door-knocking/turf', turfData);
    return response.data;
  } catch (error) {
    console.error('Error creating turf:', error);
    throw error;
  }
}

export async function getTurfVoters(turfId) {
  try {
    const response = await apiClient.get(`/door-knocking/turf/${turfId}/voters`);
    return response.data;
  } catch (error) {
    console.error('Error fetching turf voters:', error);
    return [];
  }
}

export async function assignTurfToVolunteer(volunteerId, turfId) {
  try {
    const formData = new FormData();
    formData.append('turf_id', turfId);
    const response = await apiClient.post(
      `/door-knocking/volunteers/${volunteerId}/assign-turf`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error assigning turf to volunteer:', error);
    throw error;
  }
}

export async function getVolunteerProgress(volunteerId) {
  try {
    const response = await apiClient.get(`/door-knocking/volunteers/${volunteerId}/progress`);
    return response.data;
  } catch (error) {
    console.error('Error fetching volunteer progress:', error);
    return { progress: [] };
  }
}

export async function getVolunteers() {
  try {
    const response = await apiClient.get('/volunteers/');
    return response.data;
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    return [];
  }
}

export async function logCanvassingInteraction(logData) {
  try {
    // For volunteer interactions, we don't require authentication
    const response = await fetch(`${API_BASE_URL}/door-knocking/canvassing-log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to log interaction');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error logging canvassing interaction:', error);
    throw error;
  }
}

export async function getTurfProgress(turfId) {
  try {
    const response = await apiClient.get(`/door-knocking/turf/${turfId}/progress`);
    return response.data;
  } catch (error) {
    console.error('Error fetching turf progress:', error);
    return { total_interactions: 0, total_voters: 0 };
  }
}

export async function deleteTurf(turfId) {
  try {
    const response = await apiClient.delete(`/door-knocking/turf/${turfId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting turf:', error);
    throw error;
  }
}