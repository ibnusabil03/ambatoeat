import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import reservationService from '../../services/reservationService';
import menuService from '../../services/menuService';
import tableService from '../../services/tableService';
import { FiUsers, FiCalendar, FiCoffee, FiGrid } from 'react-icons/fi';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    activeReservations: 0,
    menuItems: 0,
    tables: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentReservations, setRecentReservations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [reservationsRes, menuRes, tablesRes] = await Promise.all([
          reservationService.getAllReservations(),
          menuService.getAllMenuItems(),
          tableService.getAllTables()
        ]);

        if (reservationsRes.success && menuRes.success && tablesRes.success) {
          // Count active reservations
          const activeReservations = reservationsRes.data.filter(
            r => r.status === 'ACTIVE'
          ).length;

          setStats({
            activeReservations,
            menuItems: menuRes.data.length,
            tables: tablesRes.data.length
          });

          // Get recent reservations
          const sortedReservations = [...reservationsRes.data]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

          setRecentReservations(sortedReservations);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <h1 className="text-3xl font-bold font-serif">Dashboard Admin</h1>
          <p className="mt-2">Selamat datang di panel admin AmbatoEat</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-full mr-4">
                <FiCalendar className="text-primary text-xl" />
              </div>
              <div>
                <p className="text-gray-500">Reservasi Aktif</p>
                <h3 className="text-3xl font-bold">{stats.activeReservations}</h3>
              </div>
            </div>
            <Link to="/admin/reservations" className="text-primary hover:underline text-sm mt-4 inline-block">
              Lihat Detail
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-full mr-4">
                <FiCoffee className="text-primary text-xl" />
              </div>
              <div>
                <p className="text-gray-500">Menu</p>
                <h3 className="text-3xl font-bold">{stats.menuItems}</h3>
              </div>
            </div>
            <Link to="/admin/menu" className="text-primary hover:underline text-sm mt-4 inline-block">
              Kelola Menu
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-full mr-4">
                <FiGrid className="text-primary text-xl" />
              </div>
              <div>
                <p className="text-gray-500">Meja</p>
                <h3 className="text-3xl font-bold">{stats.tables}</h3>
              </div>
            </div>
            <Link to="/admin/tables" className="text-primary hover:underline text-sm mt-4 inline-block">
              Kelola Meja
            </Link>
          </div>
        </div>

        {/* Quick Access */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-serif mb-4">Akses Cepat</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/admin/reservations" className="bg-gray-100 hover:bg-gray-200 rounded-lg p-4 text-center">
              <FiCalendar className="text-primary text-2xl mx-auto mb-2" />
              <span>Reservasi</span>
            </Link>
            <Link to="/admin/menu" className="bg-gray-100 hover:bg-gray-200 rounded-lg p-4 text-center">
              <FiCoffee className="text-primary text-2xl mx-auto mb-2" />
              <span>Menu</span>
            </Link>
            <Link to="/admin/tables" className="bg-gray-100 hover:bg-gray-200 rounded-lg p-4 text-center">
              <FiGrid className="text-primary text-2xl mx-auto mb-2" />
              <span>Meja</span>
            </Link>
            <Link to="/" className="bg-gray-100 hover:bg-gray-200 rounded-lg p-4 text-center">
              <FiUsers className="text-primary text-2xl mx-auto mb-2" />
              <span>Tampilan User</span>
            </Link>
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-serif mb-4">Reservasi Terbaru</h2>
          
          {recentReservations.length > 0 ? (
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentReservations.map((reservation) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Belum ada data reservasi.</p>
          )}
          
          <div className="mt-4 text-right">
            <Link to="/admin/reservations" className="text-primary hover:underline text-sm">
              Lihat semua reservasi
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;