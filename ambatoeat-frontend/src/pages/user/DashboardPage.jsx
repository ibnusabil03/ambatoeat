import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import restaurantService from '../../services/restaurantService';
import { FiClock, FiMapPin, FiPhone } from 'react-icons/fi';

const DashboardPage = () => {
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await restaurantService.getRestaurantInfo();
        
        if (response.success) {
          setRestaurantInfo(response.data.restaurant);
          setFacilities(response.data.facilities);
        }
      } catch (error) {
        console.error('Error fetching restaurant info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      {/* Hero Section */}
      <div 
        className="relative bg-cover bg-center h-96" 
        style={{ 
          backgroundImage: restaurantInfo?.image 
            ? `url(${restaurantInfo.image})` 
            : 'url(/images/restaurant-default.jpg)' 
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">
              {restaurantInfo?.name || 'AmbatoEat'}
            </h1>
            <p className="text-xl max-w-2xl mx-auto">
              {restaurantInfo?.description || 'Selamat datang di restoran kami. Nikmati pengalaman kuliner yang tak terlupakan.'}
            </p>
            <Link to="/reservation" className="btn btn-primary mt-6 inline-block">
              Reservasi Sekarang
            </Link>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <section className="py-16 bg-background-light">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start">
              <div className="bg-primary text-white p-3 rounded-md mr-4">
                <FiClock size={24} />
              </div>
              <div>
                <h3 className="text-xl font-serif mb-2">Jam Buka</h3>
                <p className="text-gray-600">Senin - Jumat: 10:00 - 22:00</p>
                <p className="text-gray-600">Sabtu: 10:00 - 23:00</p>
                <p className="text-gray-600">Minggu: 11:00 - 22:00</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-primary text-white p-3 rounded-md mr-4">
                <FiMapPin size={24} />
              </div>
              <div>
                <h3 className="text-xl font-serif mb-2">Lokasi</h3>
                <p className="text-gray-600">
                  {restaurantInfo?.address || 'Jl. Raya Ambato No. 123, Jakarta, Indonesia'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-primary text-white p-3 rounded-md mr-4">
                <FiPhone size={24} />
              </div>
              <div>
                <h3 className="text-xl font-serif mb-2">Kontak</h3>
                <p className="text-gray-600">
                  {restaurantInfo?.phone || '+62 123 456 7890'}
                </p>
                <p className="text-gray-600">
                  {restaurantInfo?.email || 'info@ambatoeat.com'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">Fasilitas Kami</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nikmati berbagai fasilitas modern yang kami sediakan untuk kenyamanan Anda
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities && facilities.length > 0 ? (
              facilities.map((facility) => (
                <div key={facility.id} className="card">
                  <div className="p-6">
                    <h3 className="text-xl font-serif mb-3">{facility.name}</h3>
                    <p className="text-gray-600">{facility.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">Belum ada data fasilitas.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Owner Section */}
      {restaurantInfo?.ownerName && (
        <section className="py-16 bg-background-light">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/3 mb-8 md:mb-0">
                {restaurantInfo.ownerImage ? (
                  <img 
                    src={restaurantInfo.ownerImage} 
                    alt={restaurantInfo.ownerName} 
                    className="rounded-full w-64 h-64 object-cover mx-auto shadow-lg"
                  />
                ) : (
                  <div className="rounded-full w-64 h-64 bg-gray-300 flex items-center justify-center mx-auto">
                    <span className="text-gray-500 text-lg">No Image</span>
                  </div>
                )}
              </div>
              
              <div className="md:w-2/3 md:pl-16">
                <h2 className="text-3xl font-serif font-bold mb-4">
                  {restaurantInfo.ownerName}
                </h2>
                <div className="text-gray-600 text-lg italic mb-6">
                  <blockquote className="border-l-4 border-primary pl-4 py-2">
                    "{restaurantInfo.ownerQuote || 'Kami berkomitmen untuk menyajikan makanan berkualitas dengan pelayanan terbaik.'}"
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold mb-6">Ingin Mencoba Pengalaman Kuliner Terbaik?</h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto">
            Reservasi meja Anda sekarang dan nikmati hidangan spesial dari chef kami.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/reservation" className="btn bg-white text-primary hover:bg-gray-100">
              Reservasi Sekarang
            </Link>
            <Link to="/menu" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary">
              Lihat Menu
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DashboardPage;