import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/common/Layout';
import reservationService from '../../services/reservationService';
import { FiSearch, FiTrash2, FiFilter } from 'react-icons/fi';
import React from 'react';

const ReservationPage = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deleteType, setDeleteType] = useState('SOFT');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await reservationService.getAllReservations();
      
      if (response.success) {
        setReservations(response.data);
        setFilteredReservations(response.data);
      } else {
        toast.error('Gagal memuat data reservasi');
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Gagal memuat data reservasi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply filters
    let result = [...reservations];
  
    // Filter by status
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'COMPLETED') {
        result = result.filter(reservation => 
          reservation.status === 'COMPLETED' || reservation.status === 'CANCELED' // Include soft deleted reservations
        );
      } else {
        result = result.filter(reservation => reservation.status === statusFilter);
      }
    }
  
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        reservation => 
          reservation.user.name.toLowerCase().includes(term) ||
          reservation.user.phone?.toLowerCase().includes(term) ||
          reservation.table.tableNumber.toString().includes(term)
      );
    }
  
    setFilteredReservations(result);
  }, [reservations, searchTerm, statusFilter]);

  const handleDeleteClick = (reservation) => {
    setSelectedReservation(reservation);
    setShowModal(true);
  };

  const handleDeleteReservation = async () => {
    if (!selectedReservation) {
      console.log("No reservation selected");
      return;
    }
  
    console.log("Deleting reservation:", selectedReservation);
    console.log("Delete type:", deleteType);
  
    // Use the correct function names from the reservationService
    const deleteFunction = deleteType === 'SOFT'
      ? reservationService.cancelReservation  // Soft delete
      : reservationService.deleteReservation;  // Hard delete
  
    try {
      const response = await deleteFunction(selectedReservation.id);
      if (response.success) {
        toast.success('Reservasi berhasil dihapus');
        setShowModal(false);
        fetchReservations(); // Refresh the list
      } else {
        toast.error(response.message || 'Gagal menghapus reservasi');
      }
    } catch (error) {
      console.error('Delete reservation error:', error);
      toast.error('Gagal menghapus reservasi');
    }
  };   

  const closeModal = () => {
    setShowModal(false);
    setSelectedReservation(null);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Check if reservation is upcoming
  const isUpcoming = (dateString) => {
    const reservationDate = new Date(dateString);
    const now = new Date();
    return reservationDate > now;
  };

  // Define status options
  const statusOptions = [
    { value: 'ALL', label: 'Semua Status' },
    { value: 'ACTIVE', label: 'Aktif' },
    { value: 'COMPLETED', label: 'Selesai' },
    { value: 'CANCELED', label: 'Dibatalkan' }
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
          <h1 className="text-3xl font-bold font-serif">Manajemen Reservasi</h1>
          <p className="mt-2">Kelola semua reservasi pelanggan</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari pelanggan atau meja..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-500" />
              <select
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredReservations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pelanggan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Meja
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Reservasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {reservation.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {reservation.user.phone || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Meja {reservation.table.tableNumber}</div>
                        <div className="text-sm text-gray-500">{reservation.table.capacity} orang</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(reservation.reservationDate)}</div>
                        <div className="text-sm text-gray-500">
                          {isUpcoming(reservation.reservationDate) ? 'Mendatang' : 'Lewat'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          reservation.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : reservation.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {reservation.status === 'ACTIVE' 
                            ? 'Aktif' 
                            : reservation.status === 'COMPLETED' 
                            ? 'Selesai' 
                            : 'Dibatalkan'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleDeleteClick(reservation)}
                          className="text-red-600 hover:text-red-800 flex items-center"
                        >
                          <FiTrash2 className="mr-1" />
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Tidak ada data reservasi yang ditemukan.</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Konfirmasi Penghapusan</h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus reservasi meja {selectedReservation?.table?.tableNumber} atas nama {selectedReservation?.user?.name} pada tanggal {formatDate(selectedReservation?.reservationDate)}?
            </p>
            <p className="text-red-600 text-sm mb-6">
              Perhatian: Tindakan ini tidak dapat dibatalkan.
            </p>

            {/* Soft and Hard Delete Options */}
            <div className="flex items-center space-x-4 mb-6">
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="deleteType"
                    value="SOFT"
                    checked={deleteType === 'SOFT'}
                    onChange={() => setDeleteType('SOFT')}
                    className="form-radio"
                  />
                  <span className="ml-2">Hapus Soft (Tandai sebagai Selesai)</span>

                  <input
                    type="radio"
                    name="deleteType"
                    value="HARD"
                    checked={deleteType === 'HARD'}
                    onChange={() => setDeleteType('HARD')}
                    className="form-radio"
                  />
                  <span className="ml-2">Hapus Hard (Hapus Permanen)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteReservation}
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

export default ReservationPage;