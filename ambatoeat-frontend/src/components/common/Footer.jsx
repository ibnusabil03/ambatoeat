import { FiPhone, FiMail, FiMapPin, FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-secondary text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Restaurant Info */}
          <div>
            <h3 className="text-xl font-serif text-accent mb-4">AmbatoEat</h3>
            <p className="mb-4 text-gray-300">
              Restoran modern dengan cita rasa autentik yang menyajikan hidangan terbaik untuk Anda.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-accent">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-accent">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-accent">
                <FiTwitter size={20} />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-serif text-accent mb-4">Kontak</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FiMapPin className="mt-1 mr-3 text-accent" />
                <span>Jl. Raya Ambato No. 123, Jakarta, Indonesia</span>
              </li>
              <li className="flex items-center">
                <FiPhone className="mr-3 text-accent" />
                <span>+62 123 456 7890</span>
              </li>
              <li className="flex items-center">
                <FiMail className="mr-3 text-accent" />
                <span>info@ambatoeat.com</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-serif text-accent mb-4">Tautan</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-accent">Beranda</Link>
              </li>
              <li>
                <Link to="/menu" className="text-gray-300 hover:text-accent">Menu</Link>
              </li>
              <li>
                <Link to="/reservation" className="text-gray-300 hover:text-accent">Reservasi</Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-xl font-serif text-accent mb-4">Jam Buka</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex justify-between">
                <span>Senin - Jumat</span>
                <span>10:00 - 22:00</span>
              </li>
              <li className="flex justify-between">
                <span>Sabtu</span>
                <span>10:00 - 23:00</span>
              </li>
              <li className="flex justify-between">
                <span>Minggu</span>
                <span>11:00 - 22:00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} AmbatoEat. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;