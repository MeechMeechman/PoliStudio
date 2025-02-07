import React, { useState } from 'react';
import axios from 'axios';
import '../styles/EventForm.css';

// Helper function to produce a local datetime string in the "datetime-local" input format
function getLocalDateTimeString(date) {
  const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  const localDate = new Date(date.getTime() - tzOffset);
  return localDate.toISOString().slice(0, 16);
}

const EventForm = ({ onEventCreated, eventToEdit, onClose }) => {
  const [formData, setFormData] = useState({
    name: eventToEdit?.name || '',
    date_time: eventToEdit ? getLocalDateTimeString(new Date(eventToEdit.start)) : '',
    location: eventToEdit?.extendedProps.location || '',
    description: eventToEdit?.extendedProps.description || '',
    type: eventToEdit?.extendedProps.type || '',
    recurring: eventToEdit?.extendedProps.recurring || false,
    recurrence_pattern: eventToEdit?.recurrence_pattern || ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (eventToEdit) {
        await axios.put(`http://127.0.0.1:8000/events/${eventToEdit.id}`, formData);
      } else {
        await axios.post('http://127.0.0.1:8000/events', formData);
      }
      onEventCreated();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error saving event');
    }
  };

  return (
    <div className="event-form-modal">
      <div className="event-form">
        <h2 className="text-xl font-bold mb-4">
          {eventToEdit ? 'Edit Event' : 'Create Event'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Event Name:</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className="w-full border rounded p-2" 
              required 
            />
          </div>
          <div>
            <label className="block mb-1">Date & Time:</label>
            <input 
              type="datetime-local" 
              name="date_time" 
              value={formData.date_time} 
              onChange={handleChange} 
              className="w-full border rounded p-2" 
              required 
            />
          </div>
          <div>
            <label className="block mb-1">Location:</label>
            <input 
              type="text" 
              name="location" 
              value={formData.location} 
              onChange={handleChange} 
              className="w-full border rounded p-2" 
              required 
            />
          </div>
          <div>
            <label className="block mb-1">Description:</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Event Type:</label>
            <input 
              type="text" 
              name="type" 
              value={formData.type} 
              onChange={handleChange} 
              className="w-full border rounded p-2"
              placeholder="Enter event type"
            />
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              name="recurring" 
              checked={formData.recurring} 
              onChange={handleChange} 
              className="mr-2"
            />
            <label>Recurring Event</label>
          </div>
          {formData.recurring && (
            <div>
              <label className="block mb-1">Recurrence Pattern (JSON):</label>
              <input 
                type="text" 
                name="recurrence_pattern" 
                value={formData.recurrence_pattern} 
                onChange={handleChange} 
                className="w-full border rounded p-2"
                placeholder='e.g., {"frequency": "weekly", "interval": 1}'
              />
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              Save
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
