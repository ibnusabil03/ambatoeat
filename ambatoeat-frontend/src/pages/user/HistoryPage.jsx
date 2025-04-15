import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/common/Layout';
import reservationService from '../../services/reservationService';
import { FiCalendar, FiClock, FiUsers, FiTrash2 } from 'react-icons/fi';
import React from 'react';

const HistoryPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await reservationService.getUserReservations();
      
      if (response.success) {
        setReservations(response.data);
      } else {
        toast.error('Gagal memuat riwayat reservasi');
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Gagal memuat riwayat reservasi');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (reservation) => {
    setSelectedReservation(reservation);
    setShowModal(true);
  };

  const handleCancelReservation = async () => {
    if (!selectedReservation) return;
    
    try {
      const response = await reservationService.cancelReservation(selectedReservation.id);
      
      if (response.success) {
        toast.success('Reservasi berhasil dibatalkan');
        setShowModal(false);
        // Refresh the list
        fetchReservations();
      } else {
        toast.error(response.message || 'Gagal membatalkan reservasi');
      }
    } catch (error) {
      console.error('Cancel reservation error:', error);
      toast.error('Gagal membatalkan reservasi');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReservation(null);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
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

  // Group reservations by status
  const upcomingReservations = reservations.filter(res => 
    res.status === 'ACTIVE' && isUpcoming(res.reservationDate)
  );
  
  const pastReservations = reservations.filter(res => 
    res.status === 'ACTIVE' && !isUpcoming(res.reservationDate)
  );
  
  const canceledReservations = reservations.filter(res => 
    res.status === 'CANCELED'
  );

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
      {/* Header */}
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold font-serif">Riwayat Reservasi</h1>
          <p className="mt-2">Kelola dan lihat riwayat reservasi Anda</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {reservations.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">Anda belum memiliki riwayat reservasi.</p>
            <a href="/reservation" className="btn btn-primary">Buat Reservasi</a>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Upcoming Reservations */}
            <section>
              <h2 className="text-2xl font-serif mb-6">Reservasi Mendatang</h2>
              
              {upcomingReservations.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {upcomingReservations.map((reservation) => (
                    <div key={reservation.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-medium">Meja {reservation.table.tableNumber}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Aktif
                        </span>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-gray-600">
                          <FiCalendar className="mr-2" />
                          <span>{formatDate(reservation.reservationDate)}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <FiUsers className="mr-2" />
                          <span>Kapasitas: {reservation.table.capacity} orang</span>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <button
                          onClick={() => handleCancelClick(reservation)}
                          className="flex items-center text-red-600 hover:text-red-800"
                        >
                          <FiTrash2 className="mr-1" />
                          Batalkan Reservasi
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Tidak ada reservasi mendatang.</p>
              )}
            </section>
            
            {/* Past Reservations */}
            {pastReservations.length > 0 && (
              <section>
                <h2 className="text-2xl font-serif mb-6">Reservasi Selesai</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {pastReservations.map((reservation) => (
                    <div key={reservation.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-medium">Meja {reservation.table.tableNumber}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Selesai
                        </span>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-gray-600">
                          <FiCalendar className="mr-2" />
                          <span>{formatDate(reservation.reservationDate)}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <FiUsers className="mr-2" />
                          <span>Kapasitas: {reservation.table.capacity} orang</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* Canceled Reservations */}
            {canceledReservations.length > 0 && (
              <section>
                <h2 className="text-2xl font-serif mb-6">Reservasi Dibatalkan</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {canceledReservations.map((reservation) => (
                    <div key={reservation.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500 opacity-75">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-medium">Meja {reservation.table.tableNumber}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Dibatalkan
                        </span>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-gray-600">
                          <FiCalendar className="mr-2" />
                          <span>{formatDate(reservation.reservationDate)}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <FiUsers className="mr-2" />
                          <span>Kapasitas: {reservation.table.capacity} orang</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <FiClock className="mr-2" />
                          <span>Dibatalkan pada: {formatDate(reservation.deletedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Konfirmasi Pembatalan</h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin membatalkan reservasi meja {selectedReservation?.table?.tableNumber} pada tanggal {formatDate(selectedReservation?.reservationDate)}?
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={handleCancelReservation}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HistoryPage;