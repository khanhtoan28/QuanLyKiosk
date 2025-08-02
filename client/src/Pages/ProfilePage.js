import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 👉 Lấy ID từ localStorage (hoặc bạn có thể lấy từ auth context)
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      setError('Không tìm thấy ID người dùng.');
      setLoading(false);
      return;
    }

    axios.get(`http://localhost:5000/api/users/${userId}`)
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Không thể tải thông tin người dùng.');
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Hồ sơ cá nhân</h1>
      <div className="bg-white shadow-lg rounded-2xl p-6 flex items-center space-x-6">
        <img
          src={user.avatar || 'https://i.pravatar.cc/150?img=3'}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover border"
        />
        <div>
          <h2 className="text-2xl font-semibold">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-gray-500 mt-1">Quyền: {user.role}</p>
          <p className="text-gray-400 mt-1 text-sm">ID: {user._id}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
