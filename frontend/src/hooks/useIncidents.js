import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Custom hook for incident management.
 *
 * Provides:
 *  - incidents list with pagination
 *  - createIncident(payload)
 *  - updateIncident(id, patch)
 *  - deleteIncident(id)
 *  - fetchIncident(id)   → single incident
 *  - fetchNotes(id)      → notes for an incident
 *  - addNote(id, text)   → post a new note
 */
export function useIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchIncidents = useCallback(async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/incidents', { params });
      setIncidents(Array.isArray(response.data.items) ? response.data.items : []);
    } catch {
      setError('Unable to load incidents. Check that the backend is running.');
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createIncident = useCallback(async (payload) => {
    const response = await api.post('/incidents', payload);
    await fetchIncidents();
    return response.data;
  }, [fetchIncidents]);

  const updateIncident = useCallback(async (id, patch) => {
    const response = await api.patch(`/incidents/${id}`, patch);
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? response.data : inc))
    );
    return response.data;
  }, []);

  const deleteIncident = useCallback(async (id) => {
    await api.delete(`/incidents/${id}`);
    setIncidents((prev) => prev.filter((inc) => inc.id !== id));
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return {
    incidents,
    loading,
    error,
    refetch: fetchIncidents,
    createIncident,
    updateIncident,
    deleteIncident,
  };
}

/**
 * Hook for a single incident with its notes.
 */
export function useIncidentDetail(incidentId) {
  const [incident, setIncident] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!incidentId) return;
    setLoading(true);
    setError('');
    try {
      const [incRes, notesRes] = await Promise.all([
        api.get(`/incidents/${incidentId}`),
        api.get(`/incidents/${incidentId}/notes`),
      ]);
      setIncident(incRes.data);
      setNotes(Array.isArray(notesRes.data) ? notesRes.data : []);
    } catch {
      setError('Unable to load incident details.');
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  const updateIncident = useCallback(async (patch) => {
    const response = await api.patch(`/incidents/${incidentId}`, patch);
    setIncident(response.data);
    return response.data;
  }, [incidentId]);

  const addNote = useCallback(async (noteText) => {
    setSubmitting(true);
    try {
      const response = await api.post(`/incidents/${incidentId}/notes`, {
        note: noteText,
      });
      setNotes((prev) => [...prev, response.data]);
      return response.data;
    } finally {
      setSubmitting(false);
    }
  }, [incidentId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    incident,
    notes,
    loading,
    error,
    submitting,
    refetch: fetchDetail,
    updateIncident,
    addNote,
  };
}
