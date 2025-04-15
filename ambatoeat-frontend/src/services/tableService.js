import api from './api';

// Get all tables (admin)
const getAllTables = async () => {
  const response = await api.get('/tables');
  return response.data;
};

// Get available tables
const getAvailableTables = async (date) => {
  const response = await api.get(`/tables/available?date=${date}`);
  return response.data;
};

// Create table (admin)
const createTable = async (tableData) => {
  const response = await api.post('/tables', tableData);
  return response.data;
};

// Update table (admin)
const updateTable = async (id, tableData) => {
  const response = await api.put(`/tables/${id}`, tableData);
  return response.data;
};

// Delete table (admin)
const deleteTable = async (id) => {
  const response = await api.delete(`/tables/${id}`);
  return response.data;
};

const tableService = {
  getAllTables,
  getAvailableTables,
  createTable,
  updateTable,
  deleteTable
};

export default tableService;