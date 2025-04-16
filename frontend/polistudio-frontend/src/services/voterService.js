import apiClient from './apiClient';

// For local dev, our backend is on port 8000
const API_BASE_URL = 'http://127.0.0.1:8000';

export async function getVoters() {
  try {
    const response = await apiClient.get('/voters/');
    return response.data;
  } catch (error) {
    console.error('Error fetching voters:', error);
    throw error;
  }
}

export async function getVoter(voterId) {
  try {
    const response = await apiClient.get(`/voters/${voterId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching voter details:', error);
    throw error;
  }
}

export async function createVoter(voterData) {
  try {
    const response = await apiClient.post('/voters/', voterData);
    return response.data;
  } catch (error) {
    console.error('Error creating voter:', error);
    throw error;
  }
}

export async function updateVoter(id, voterData) {
  try {
    const response = await apiClient.put(`/voters/${id}`, voterData);
    return response.data;
  } catch (error) {
    console.error('Error updating voter:', error);
    throw error;
  }
}

export async function deleteVoter(id) {
  try {
    await apiClient.delete(`/voters/${id}`);
  } catch (error) {
    console.error('Error deleting voter:', error);
    throw error;
  }
}

export async function importVoters(votersData) {
  try {
    const response = await apiClient.post('/voters/import', votersData);
    return response.data;
  } catch (error) {
    console.error('Error importing voters:', error);
    throw error;
  }
}

export async function exportVoters(voters, fields, format = 'csv') {
  try {
    // First attempt to use the backend API if it exists
    try {
      const response = await apiClient.post('/voters/export', { 
        format,
        fields,
        // Only send IDs to the backend if we're exporting from the database
        voters: voters.map(voter => voter.id) 
      });
      return response.data;
    } catch (apiError) {
      // If the API doesn't exist or fails, fall back to client-side export
      console.log('Falling back to client-side export', apiError);
      
      // Filter the voters data to only include the requested fields
      const filteredData = voters.map(voter => {
        const filteredVoter = {};
        fields.forEach(field => {
          if (voter[field] !== undefined) {
            filteredVoter[field] = voter[field];
          }
        });
        return filteredVoter;
      });
      
      if (format === 'json') {
        return JSON.stringify(filteredData, null, 2);
      } else {
        // Default to CSV format
        // Create CSV header
        const header = fields.join(',');
        
        // Create CSV rows
        const rows = filteredData.map(voter => {
          return fields.map(field => {
            let value = voter[field];
            
            // Handle arrays (like tags)
            if (Array.isArray(value)) {
              value = value.join('; ');
            }
            
            // Format date fields
            if (field === 'last_contacted' && value) {
              value = new Date(value).toLocaleDateString();
            }
            
            // Handle booleans
            if (typeof value === 'boolean') {
              value = value ? 'Yes' : 'No';
            }
            
            // Escape commas, quotes, etc. in CSV
            if (value === null || value === undefined) {
              return '';
            }
            
            value = String(value);
            
            // If the value contains commas, quotes, or newlines, wrap it in quotes
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              // Double up any quotes to escape them
              value = value.replace(/"/g, '""');
              return `"${value}"`;
            }
            
            return value;
          }).join(',');
        });
        
        // Combine header and rows
        return [header, ...rows].join('\n');
      }
    }
  } catch (error) {
    console.error('Error exporting voters:', error);
    throw error;
  }
}