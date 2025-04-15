import api from './api';

// Get all menu items
const getAllMenuItems = async () => {
  const response = await api.get('/menu');
  return response.data;
};

// Get menu items by category
const getMenuItemsByCategory = async (category) => {
  const response = await api.get(`/menu/category/${category}`);
  return response.data;
};

// Create menu item (admin)
const createMenuItem = async (menuData) => {
  // For file uploads, we need to use FormData
  const formData = new FormData();
  
  Object.keys(menuData).forEach(key => {
    formData.append(key, menuData[key]);
  });
  
  const response = await api.post('/menu', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Update menu item (admin)
const updateMenuItem = async (id, menuData) => {
  // For file uploads, we need to use FormData
  const formData = new FormData();
  
  Object.keys(menuData).forEach(key => {
    if (menuData[key] !== undefined) {
      formData.append(key, menuData[key]);
    }
  });
  
  const response = await api.put(`/menu/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Delete menu item (admin)
const deleteMenuItem = async (id) => {
  const response = await api.delete(`/menu/${id}`);
  return response.data;
};
 
const menuService = {
  getAllMenuItems,
  getMenuItemsByCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};

export default menuService;