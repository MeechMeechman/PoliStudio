import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EventDetailsModal = ({ event, onClose, onEventUpdated }) => {
  const [rsvpStatus, setRsvpStatus] = useState('');
  const [rsvpList, setRsvpList] = useState([]);

  const fetchRSVPs = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/events/${event.id}/rsvp`);
      setRsvpList(response.data);
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
    }
  };

  useEffect(() => {
    fetchRSVPs();
  }, [event]);

  const handleRSVP = async () => {
    if (!rsvpStatus)
      return alert('Please select an RSVP status');
    try {
      await axios.post(`http://127.0.0.1:8000/events/${event.id}/rsvp`, {
        user_id: 1, // Replace with actual user id
        status: rsvpStatus
      });
      fetchRSVPs();
      alert('RSVP submitted successfully');
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      alert('Error submitting RSVP');
    }
  };

  return (
    <div className="modal event-details-modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="modal-content bg-white p-6 rounded shadow-md max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">{event.title}</h2>
        <p><strong>Date & Time:</strong> {event.start}</p>
        <p><strong>Location:</strong> {event.extendedProps.location}</p>
        <p><strong>Description:</strong> {event.extendedProps.description}</p>
        <p><strong>Type:</strong> {event.extendedProps.type}</p>
        <div className="mt-4">
          <h3 className="font-semibold">RSVP</h3>
          <select 
            value={rsvpStatus} 
            onChange={(e) => setRsvpStatus(e.target.value)}
            className="w-full border rounded p-2 mt-2"
          >
            <option value="">Select status...</option>
            <option value="Attending">Attending</option>
            <option value="Maybe">Maybe</option>
            <option value="Declined">Declined</option>
          </select>
          <button 
            onClick={handleRSVP} 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Submit RSVP
          </button>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold">Attendees</h3>
          <ul className="list-disc ml-5">
            {rsvpList.map(rsvp => (
              <li key={rsvp.id}>
                User {rsvp.user_id}: {rsvp.status}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Close</button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
