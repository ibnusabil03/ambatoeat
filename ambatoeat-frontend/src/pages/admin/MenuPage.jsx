import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/common/Layout';
import menuService from '../../services/menuService';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';
import React from 'react';

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'FOOD',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await menuService.getAllMenuItems();

      if (response.success) {
        setMenuItems(response.data);
        setFilteredItems(response.data);
      } else {
        toast.error('Gagal memuat data menu');
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Gagal memuat data menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply filters
    let result = [...menuItems];

    // Filter by category
    if (categoryFilter !== 'ALL') {
      result = result.filter(item => item.category === categoryFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term)
      );
    }

    setFilteredItems(result);
  }, [menuItems, searchTerm, categoryFilter]);

  const openAddModal = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'FOOD',
      image: null
    });
    setImagePreview(null);
    setModalMode('add');
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: null
    });
    setImagePreview(item.image);
    setSelectedItem(item);
    setModalMode('edit');
    setShowModal(true);
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'price') {
      // Validasi input harga: angka dengan maksimal 2 desimal
      if (value === '' || /^\d*(\.\d{0,2})?$/.test(value)) {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      // Handle input biasa
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
  };

  const handleSubmit = async (e) => {
    console.log(formData);
    e.preventDefault();
    try {
      let response;

      if (modalMode === 'add') {
        response = await menuService.createMenuItem(formData);
      } else {
        response = await menuService.updateMenuItem(selectedItem.id, formData);
      }

      if (response.success) {
        toast.success(
          modalMode === 'add'
            ? 'Menu berhasil ditambahkan'
            : 'Menu berhasil diperbarui'
        );
        setShowModal(false);
        fetchMenuItems();
      } else {
        toast.error(response.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Menu submit error:', error);
      toast.error('Gagal menyimpan menu. Silakan coba lagi.');
    }
  };

  const handleDeleteMenu = async () => {
    if (!selectedItem) return;

    try {
      const response = await menuService.deleteMenuItem(selectedItem.id);

      if (response.success) {
        toast.success('Menu berhasil dihapus');
        setShowDeleteModal(false);
        fetchMenuItems();
      } else {
        toast.error(response.message || 'Gagal menghapus menu');
      }
    } catch (error) {
      console.error('Delete menu error:', error);
      toast.error('Gagal menghapus menu');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setShowDeleteModal(false);
    setSelectedItem(null);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Category options
  const categoryOptions = [
    { value: 'ALL', label: 'Semua Kategori' },
    { value: 'FOOD', label: 'Makanan' },
    { value: 'DRINK', label: 'Minuman' },
    { value: 'DESSERT', label: 'Pencuci Mulut' }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-primary text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold font-serif">Manajemen Menu</h1>
          <p className="mt-2">Kelola menu makanan dan minuman</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari menu..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-500" />
              <select
                className="input"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="btn btn-primary flex items-center justify-center"
          >
            <FiPlus className="mr-2" />
            Tambah Menu
          </button>
        </div>

        {/* Menu Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img
                    src={item.image || '/images/default-food.jpg'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/default-food.jpg';
                    }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-serif">{item.name}</h3>
                    <span className="text-primary font-bold">{formatCurrency(item.price)}</span>
                  </div>
                  <p className="text-gray-600 mt-2 text-sm line-clamp-3">
                    {item.description}
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                      {item.category === 'FOOD' ? 'Makanan' :
                        item.category === 'DRINK' ? 'Minuman' : 'Dessert'}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 text-blue-600 hover:text-blue-800"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(item)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 mb-4">Tidak ada menu yang ditemukan.</p>
            <button
              onClick={openAddModal}
              className="btn btn-primary"
            >
              Tambah Menu Baru
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {modalMode === 'add' ? 'Tambah Menu Baru' : 'Edit Menu'}
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Menu
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  className="input"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>

              {/* Price */}
              <div className="mb-4">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Harga (Rp)
                </label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  className="input"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="contoh: 25000"
                  required
                />
              </div>

              {/* Category */}
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  id="category"
                  name="category"
                  className="input"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="FOOD">Makanan</option>
                  <option value="DRINK">Minuman</option>
                  <option value="DESSERT">Pencuci Mulut</option>
                </select>
              </div>

              {/* Image URL */}
              <div className="mb-4">
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  Gambar
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  className="input p-2"
                  onChange={handleInputChange}
                  placeholder="Masukkan URL gambar"
                  {...(modalMode === 'add' && { required: true })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Masukkan URL gambar yang valid (contoh: https://example.com/image.jpg)
                </p>
              </div>
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-4">
                  <p className="block text-sm font-medium text-gray-700 mb-1">
                    Preview
                  </p>
                  <div className="w-full h-40 overflow-hidden rounded-md">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {modalMode === 'add' ? 'Tambah Menu' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Konfirmasi Penghapusan</h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus menu <span className="font-semibold">{selectedItem?.name}</span>?
            </p>
            <p className="text-red-600 text-sm mb-6">
              Perhatian: Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteMenu}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MenuPage;