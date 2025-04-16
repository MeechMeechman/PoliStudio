import axios from 'axios';
import apiClient from './apiClient';

const API_BASE_URL = 'http://127.0.0.1:8000';

export async function createCampaign(formData) {
  try {
    const response = await apiClient.post('/phone-banking/campaigns', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to create campaign');
  }
}

export async function getCampaigns() {
  try {
    const response = await apiClient.get('/phone-banking/campaigns');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch campaigns');
  }
}

export async function getVolunteerCalls(campaignId, volunteerId) {
  try {
    // Extract just the ID if a volunteer object is passed
    const id = typeof volunteerId === 'object' ? volunteerId.id : volunteerId;
    
    const response = await apiClient.get(`/phone-banking/campaigns/${campaignId}/calls`, {
      params: { volunteer_id: id },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch calls');
  }
}

export async function updateCallStatus(callId, status, notes, supportLevel) {
  try {
    if (!callId) {
      throw new Error('Call ID is required');
    }
    
    const response = await apiClient.put(`/phone-banking/calls/${callId}`, {
      status,
      notes,
      support_level: supportLevel,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating call status:', error);
    throw new Error(error.response?.data?.detail || 'Failed to update call status');
  }
}

export async function getCampaignStats(campaignId) {
  try {
    const response = await apiClient.get(`/phone-banking/campaigns/${campaignId}/stats`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch campaign statistics');
  }
}

export async function exportCampaignData(campaignId) {
  try {
    const response = await apiClient.get(`/phone-banking/campaigns/${campaignId}/export`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `campaign-${campaignId}-export.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to export campaign data');
  }
}

export async function deleteCampaign(campaignId) {
  try {
    await apiClient.delete(`/phone-banking/campaigns/${campaignId}`);
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to delete campaign');
  }
}

export async function getCampaignInfo(campaignId) {
  try {
    const response = await apiClient.get(`/phone-banking/campaigns/${campaignId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch campaign info');
  }
}