import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import EventForm from './EventForm';
import EventDetailsModal from './EventDetailsModal';
import '../styles/EventsCalendar.css';

const EventsCalendar = () => {
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/events');
      const calendarEvents = response.data.map(event => ({
        id: event.id,
        title: event.name,
        start: event.date_time,
        extendedProps: {
          location: event.location,
          description: event.description,
          type: event.type,
          recurring: event.recurring,
          recurrence_pattern: event.recurrence_pattern || ''
        }
      }));
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDateClick = () => {
    setEditEvent(null);
    setShowEventForm(true);
  };

  const handleEventClick = (clickInfo) => {
    const calEvent = clickInfo.event;
    const eventForEditing = {
      id: calEvent.id,
      name: calEvent.title,
      start: calEvent.start,
      recurrence_pattern: calEvent.extendedProps.recurrence_pattern || '',
      extendedProps: {
        location: calEvent.extendedProps.location,
        description: calEvent.extendedProps.description,
        type: calEvent.extendedProps.type,
        recurring: calEvent.extendedProps.recurring
      }
    };
    setEditEvent(eventForEditing);
    setShowEventForm(true);
  };

  const handleEventCreated = () => {
    fetchEvents();
  };

  return (
    <div className="events-calendar-page">
      <header className="events-header flex justify-between items-center p-4 bg-gray-100">
        <h1 className="text-2xl font-bold">Events and Calendar</h1>
        <button 
          onClick={() => { setEditEvent(null); setShowEventForm(true); }}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Create Event
        </button>
      </header>
      <div className="events-container p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
        />
      </div>
      {showEventForm && (
        <EventForm 
          onEventCreated={handleEventCreated}
          eventToEdit={editEvent}
          onClose={() => setShowEventForm(false)}
        />
      )}
      {showDetailsModal && selectedEvent && (
        <EventDetailsModal 
          event={selectedEvent}
          onClose={() => setShowDetailsModal(false)}
          onEventUpdated={handleEventCreated}
        />
      )}
    </div>
  );
};

export default EventsCalendar;
