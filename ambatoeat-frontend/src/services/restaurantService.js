import api from './api';

// Get restaurant info
const getRestaurantInfo = async () => {
  const response = await api.get('/restaurant');
  return response.data;
};

// Update restaurant info (admin)
const updateRestaurantInfo = async (restaurantData) => {
  // For file uploads, we need to use FormData
  const formData = new FormData();
  
  Object.keys(restaurantData).forEach(key => {
    if (restaurantData[key] !== undefined) {
      formData.append(key, restaurantData[key]);
    }
  });
  
  const response = await api.put('/restaurant', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Add facility (admin)
const addFacility = async (facilityData) => {
  const response = await api.post('/restaurant/facility', facilityData);
  return response.data;
};

// Delete facility (admin)
const deleteFacility = async (id) => {
  const response = await api.delete(`/restaurant/facility/${id}`);
  return response.data;
};

const restaurantService = {
  getRestaurantInfo,
  updateRestaurantInfo,
  addFacility,
  deleteFacility
};

export default restaurantService;