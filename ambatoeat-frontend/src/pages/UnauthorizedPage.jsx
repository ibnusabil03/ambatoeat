import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import React from 'react';

const UnauthorizedPage = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <h1 className="text-9xl font-bold text-primary">403</h1>
        <h2 className="text-4xl font-serif mt-6 mb-4 text-center">Akses Ditolak</h2>
        <p className="text-gray-600 text-lg text-center mb-8">
          Anda tidak memiliki akses ke halaman ini. Halaman ini hanya tersedia untuk admin.
        </p>
        <Link to="/" className="btn btn-primary">
          Kembali ke Beranda
        </Link>
      </div>
    </Layout>
  );
};

export default UnauthorizedPage;