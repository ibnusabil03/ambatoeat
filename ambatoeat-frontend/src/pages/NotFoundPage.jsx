import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import React from 'react';

const NotFoundPage = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-4xl font-serif mt-6 mb-4 text-center">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-600 text-lg text-center mb-8">
          Halaman yang Anda cari tidak ditemukan atau telah dihapus.
        </p>
        <Link to="/" className="btn btn-primary">
          Kembali ke Beranda
        </Link>
      </div>
    </Layout>
  );
};

export default NotFoundPage;