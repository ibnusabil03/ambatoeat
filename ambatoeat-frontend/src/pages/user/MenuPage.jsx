import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import menuService from '../../services/menuService';
import { FiCoffee, FiShoppingBag } from 'react-icons/fi';
import { GiCupcake } from 'react-icons/gi';
import React from 'react';

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await menuService.getAllMenuItems();
        
        if (response.success) {
          setMenuItems(response.data);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const categories = [
    { id: 'ALL', name: 'Semua', icon: <FiShoppingBag /> },
    { id: 'FOOD', name: 'Makanan', icon: <FiShoppingBag /> },
    { id: 'DRINK', name: 'Minuman', icon: <FiCoffee /> },
    { id: 'DESSERT', name: 'Pencuci Mulut', icon: <GiCupcake /> },
  ];

  const filteredMenuItems = activeCategory === 'ALL' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDefaultImage = (category) => {
    switch(category) {
      case 'FOOD':
        return '/images/default-food.jpg';
      case 'DRINK':
        return '/images/default-drink.jpg';
      case 'DESSERT':
        return '/images/default-dessert.jpg';
      default:
        return '/images/default-food.jpg';
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
      {/* Hero Section */}
      <div className="relative bg-cover bg-center h-64" style={{ backgroundImage: 'url(/images/menu-hero.jpg)' }}>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold font-serif mb-2">Menu Kami</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Nikmati berbagai pilihan hidangan yang kami sajikan dengan cinta.
            </p>
          </div>
        </div>
      </div>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Category Tabs */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex flex-wrap rounded-lg bg-gray-100 p-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`flex items-center px-4 py-2 rounded-md transition-all ${
                    activeCategory === category.id
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Grid */}
          {filteredMenuItems.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map((item) => (
                <div key={item.id} className="card hover:shadow-lg transition-shadow">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={item.image || getDefaultImage(item.category)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getDefaultImage(item.category);
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
                    <div className="mt-4">
                      <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                        {item.category === 'FOOD' ? 'Makanan' : 
                         item.category === 'DRINK' ? 'Minuman' : 'Dessert'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Tidak ada menu {activeCategory !== 'ALL' ? `dengan kategori ${activeCategory.toLowerCase()}` : ''} yang tersedia.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default MenuPage;