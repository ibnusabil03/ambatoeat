import api from './api';

// Create reservation
const createReservation = async (reservationData) => {
  const response = await api.post('/reservations', reservationData);
  return response.data;
};

// Get user reservations
const getUserReservations = async () => {
  const response = await api.get('/reservations/user');
  return response.data;
};

// Get all reservations (admin)
const getAllReservations = async () => {
  const response = await api.get('/reservations');
  return response.data;
};

// Reservation Success (user - soft delete)
const cancelReservation = async (id) => {
  const response = await api.delete(`/reservations/user/${id}`);
  return response.data;
};

// Delete reservation (admin - hard delete)
const deleteReservation = async (id) => {
  const response = await api.delete(`/reservations/admin/${id}`);
  return response.data;
};

const reservationService = {
  createReservation,
  getUserReservations,
  getAllReservations,
  cancelReservation,
  deleteReservation
};

export default reservationService;