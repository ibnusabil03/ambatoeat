import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/common/Layout';
import tableService from '../../services/tableService';
import { FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import React from 'react';

const TablePage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedTable, setSelectedTable] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: '',
    status: 'AVAILABLE'
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await tableService.getAllTables();
      
      if (response.success) {
        setTables(response.data);
      } else {
        toast.error('Gagal memuat data meja');
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Gagal memuat data meja');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      tableNumber: '',
      capacity: '',
      status: 'AVAILABLE'
    });
    setModalMode('add');
    setShowModal(true);
  };

  const openEditModal = (table) => {
    setFormData({
      tableNumber: table.tableNumber.toString(),
      capacity: table.capacity.toString(),
      status: table.status
    });
    setSelectedTable(table);
    setModalMode('edit');
    setShowModal(true);
  };

  const openDeleteModal = (table) => {
    setSelectedTable(table);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if ((name === 'tableNumber' || name === 'capacity') && value !== '') {
      // Only allow numeric input for tableNumber and capacity
      if (/^\d+$/.test(value)) {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.tableNumber || !formData.capacity) {
      toast.error('Nomor meja dan kapasitas harus diisi');
      return;
    }
    
    try {
      let response;
      
      if (modalMode === 'add') {
        response = await tableService.createTable(formData);
      } else {
        response = await tableService.updateTable(selectedTable.id, formData);
      }
      
      if (response.success) {
        toast.success(
          modalMode === 'add' 
            ? 'Meja berhasil ditambahkan' 
            : 'Meja berhasil diperbarui'
        );
        setShowModal(false);
        fetchTables();
      } else {
        toast.error(response.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Table submit error:', error);
      toast.error('Gagal menyimpan data meja. Silakan coba lagi.');
    }
  };

  const handleDeleteTable = async () => {
    if (!selectedTable) return;
    
    try {
      const response = await tableService.deleteTable(selectedTable.id);
      
      if (response.success) {
        toast.success('Meja berhasil dihapus');
        setShowDeleteModal(false);
        fetchTables();
      } else {
        toast.error(response.message || 'Gagal menghapus meja');
      }
    } catch (error) {
      console.error('Delete table error:', error);
      toast.error('Gagal menghapus meja. Mungkin ada reservasi aktif pada meja ini.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setShowDeleteModal(false);
    setSelectedTable(null);
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'AVAILABLE':
        return <FiCheckCircle className="text-green-500" size={20} />;
      case 'RESERVED':
        return <FiXCircle className="text-red-500" size={20} />;
      case 'MAINTENANCE':
        return <FiAlertCircle className="text-yellow-500" size={20} />;
      default:
        return null;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'AVAILABLE':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Tersedia
          </span>
        );
      case 'RESERVED':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            Dipesan
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Pemeliharaan
          </span>
        );
      default:
        return null;
    }
  };

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
          <h1 className="text-3xl font-bold font-serif">Manajemen Meja</h1>
          <p className="mt-2">Kelola meja restaurant</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="flex justify-end mb-6">
          <button
            onClick={openAddModal}
            className="btn btn-primary flex items-center"
          >
            <FiPlus className="mr-2" />
            Tambah Meja
          </button>
        </div>

        {/* Tables */}
        {tables.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => (
              <div key={table.id} className="bg-white rounded-lg shadow-md p-6 relative">
                <div className="absolute top-4 right-4">
                  {getStatusIcon(table.status)}
                </div>
                
                <h3 className="text-xl font-serif mb-2">Meja {table.tableNumber}</h3>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Kapasitas</p>
                    <p className="font-medium">{table.capacity} orang</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div>{getStatusBadge(table.status)}</div>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => openEditModal(table)}
                    className="btn btn-outline py-1 px-3 text-sm flex items-center"
                  >
                    <FiEdit2 className="mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(table)}
                    className="bg-red-100 text-red-600 hover:bg-red-200 transition-colors py-1 px-3 rounded-md text-sm flex items-center"
                    disabled={table.status === 'RESERVED'}
                  >
                    <FiTrash2 className="mr-1" />
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 mb-4">Tidak ada data meja.</p>
            <button
              onClick={openAddModal}
              className="btn btn-primary"
            >
              Tambah Meja Baru
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">
              {modalMode === 'add' ? 'Tambah Meja Baru' : 'Edit Meja'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              {/* Table Number */}
              <div className="mb-4">
                <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Meja
                </label>
                <input
                  type="text"
                  id="tableNumber"
                  name="tableNumber"
                  className="input"
                  value={formData.tableNumber}
                  onChange={handleInputChange}
                  required
                  {...(modalMode === 'edit' && { readOnly: true })}
                />
              </div>
              
              {/* Capacity */}
              <div className="mb-4">
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                  Kapasitas (Orang)
                </label>
                <input
                  type="text"
                  id="capacity"
                  name="capacity"
                  className="input"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              {/* Status */}
              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="input"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="AVAILABLE">Tersedia</option>
                  <option value="MAINTENANCE">Pemeliharaan</option>
                  {modalMode === 'edit' && (
                    <option value="RESERVED">Dipesan</option>
                  )}
                </select>
              </div>
              
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
                  {modalMode === 'add' ? 'Tambah Meja' : 'Simpan Perubahan'}
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
              Apakah Anda yakin ingin menghapus Meja {selectedTable?.tableNumber}?
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
                onClick={handleDeleteTable}
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

export default TablePage;