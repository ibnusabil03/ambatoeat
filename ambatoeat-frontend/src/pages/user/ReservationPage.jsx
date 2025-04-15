import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import Layout from '../../components/common/Layout';
import { useAuth } from '../../context/AuthContext';
import tableService from '../../services/tableService';
import reservationService from '../../services/reservationService';
import { FiCalendar, FiUser, FiPhone, FiUsers } from 'react-icons/fi';
import React from 'react';

const ReservationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    reservationDate: new Date(),
    tableId: ''
  });
  
  const [availableTables, setAvailableTables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTables, setIsFetchingTables] = useState(false);
  
  // Fetch available tables when the date changes
  useEffect(() => {
    const fetchAvailableTables = async () => {
      if (!formData.reservationDate) return;
      
      setIsFetchingTables(true);
      try {
        // Format date to ISO string
        const dateStr = formData.reservationDate.toISOString();
        
        const response = await tableService.getAvailableTables(dateStr);
        
        if (response.success) {
          setAvailableTables(response.data);
          
          // Reset tableId if previously selected table is no longer available
          if (formData.tableId && !response.data.some(table => table.id === parseInt(formData.tableId))) {
            setFormData({
              ...formData,
              tableId: ''
            });
          }
        } else {
          toast.error('Gagal mendapatkan meja tersedia');
        }
      } catch (error) {
        console.error('Failed to fetch available tables:', error);
        toast.error('Gagal mendapatkan meja tersedia');
      } finally {
        setIsFetchingTables(false);
      }
    };
    
    fetchAvailableTables();
  }, [formData.reservationDate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      reservationDate: date
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.tableId) {
      toast.error('Silakan pilih meja');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format the date for API
      const reservationData = {
        ...formData,
        tableId: parseInt(formData.tableId),
        reservationDate: formData.reservationDate.toISOString()
      };
      
      const response = await reservationService.createReservation(reservationData);
      
      if (response.success) {
        toast.success('Reservasi berhasil dibuat!');
        navigate('/history');
      } else {
        toast.error(response.message || 'Gagal membuat reservasi');
      }
    } catch (error) {
      console.error('Reservation error:', error);
      toast.error('Gagal membuat reservasi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter out past dates
  const isDateInPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };
  
  return (
    <Layout>
      {/* Header */}
      <div className="relative bg-cover bg-center h-64" style={{ backgroundImage: 'url(/images/reservation-hero.jpg)' }}>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold font-serif mb-2">Reservasi Meja</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Pesan meja Anda dan nikmati pengalaman bersantap yang tak terlupakan
            </p>
          </div>
        </div>
      </div>
      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-serif mb-6 text-center">Form Reservasi</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-gray-700 mb-2 flex items-center">
                      <FiUser className="mr-2" /> Nama Lengkap
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="input"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={user?.name}
                    />
                  </div>
                  
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 mb-2 flex items-center">
                      <FiPhone className="mr-2" /> Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="input"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  {/* Date */}
                  <div>
                    <label htmlFor="reservationDate" className="block text-gray-700 mb-2 flex items-center">
                      <FiCalendar className="mr-2" /> Tanggal Reservasi
                    </label>
                    <DatePicker
                      selected={formData.reservationDate}
                      onChange={handleDateChange}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      minDate={new Date()}
                      filterDate={isDateInPast}
                      className="input"
                      required
                    />
                  </div>
                  
                  {/* Table Selection */}
                  <div>
                    <label htmlFor="tableId" className="block text-gray-700 mb-2 flex items-center">
                      <FiUsers className="mr-2" /> Pilih Meja
                    </label>
                    
                    {isFetchingTables ? (
                      <div className="flex items-center space-x-2 h-10">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                        <span>Memuat meja tersedia...</span>
                      </div>
                    ) : availableTables.length > 0 ? (
                      <select
                        id="tableId"
                        name="tableId"
                        className="input"
                        value={formData.tableId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Pilih Meja</option>
                        {availableTables.map((table) => (
                          <option key={table.id} value={table.id}>
                            Meja {table.tableNumber} - {table.capacity} Orang
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-red-50 text-red-600 rounded-md border border-red-200">
                        Tidak ada meja tersedia untuk tanggal yang dipilih. Silakan pilih tanggal lain.
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-8">
                  <button
                    type="submit"
                    className="btn btn-primary w-full py-3"
                    disabled={isLoading || isFetchingTables || availableTables.length === 0}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memproses...
                      </span>
                    ) : (
                      'Pesan Sekarang'
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="mt-12">
              <h3 className="text-xl font-serif mb-4">Informasi Reservasi</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="bg-primary text-white p-1 rounded-full mr-2">1</span>
                  <span>Pilih tanggal dan waktu yang Anda inginkan.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white p-1 rounded-full mr-2">2</span>
                  <span>Pilih meja yang tersedia sesuai dengan jumlah tamu.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white p-1 rounded-full mr-2">3</span>
                  <span>Isi data diri Anda dengan lengkap.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white p-1 rounded-full mr-2">4</span>
                  <span>Reservasi Anda akan dikonfirmasi melalui email atau telepon.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white p-1 rounded-full mr-2">5</span>
                  <span>Jika ingin membatalkan reservasi, silakan lakukan melalui halaman Riwayat Reservasi minimal 2 jam sebelum waktu reservasi.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ReservationPage;