import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', avatar: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ type: 'info', title: '', body: '' });
  const [emailVerification, setEmailVerification] = useState({ email: '', step: 1, code: '' });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const timerRef = useRef(null);
  const userId = localStorage.getItem('userId');

  const startCountdown = useCallback((expiryTime) => {
    const remaining = Math.floor((expiryTime - Date.now()) / 1000);
    setCountdown(remaining > 0 ? remaining : 0);
    if (timerRef.current) clearInterval(timerRef.current);
    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          localStorage.removeItem('otp_expiry');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    timerRef.current = id;
  }, []);

  useEffect(() => {
    if (!userId) {
      setError('Không tìm thấy ID người dùng.');
      setLoading(false);
      return;
    }
    axios.get(`http://localhost:5000/api/users/${userId}`)
      .then((res) => {
        setUser(res.data);
        setFormData({ name: res.data.name, email: res.data.email, avatar: null });
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tải thông tin người dùng.');
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    const savedExpiry = localStorage.getItem('otp_expiry');
    const savedEmail = localStorage.getItem('otp_email');
    if (savedExpiry && savedEmail) {
      const expiry = parseInt(savedExpiry);
      const now = Date.now();
      if (expiry > now) {
        setEmailVerification({ email: savedEmail, step: 2, code: '' });
        setShowEmailModal(true);
        startCountdown(expiry);
      } else {
        localStorage.removeItem('otp_expiry');
        localStorage.removeItem('otp_email');
      }
    }
  }, [startCountdown]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFormData({ ...formData, avatar: e.target.files[0] });

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setModalContent({ type: 'warning', title: 'Thiếu thông tin', body: 'Vui lòng nhập họ tên và email.' });
      setModalOpen(true);
      return;
    }
    if (formData.email !== user.email) {
      setShowEmailModal(true);
      setEmailVerification({ email: formData.email, step: 1, code: '' });
      return;
    }
    await updateUser();
  };

  const updateUser = async () => {
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    if (formData.avatar) data.append('avatar', formData.avatar);

    try {
      const res = await axios.put(`http://localhost:5000/api/users/${userId}`, data);
      setUser(res.data);
      setEditing(false);
      setFormData({ ...formData, avatar: null });
      setModalContent({ type: 'success', title: 'Cập nhật thành công' });
    } catch (err) {
      setModalContent({ type: 'error', title: 'Lỗi khi cập nhật', body: 'Vui lòng thử lại sau.' });
    } finally {
      setModalOpen(true);
    }
  };

  const sendVerificationCode = async () => {
    try {
      await axios.post('http://localhost:5000/api/verify-email', { email: emailVerification.email });
      setEmailVerification({ ...emailVerification, step: 2 });
      const expiryTime = Date.now() + 60 * 1000;
      localStorage.setItem('otp_expiry', expiryTime.toString());
      localStorage.setItem('otp_email', emailVerification.email);
      startCountdown(expiryTime);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 409) {
        setModalContent({ type: 'error', title: 'Email đã tồn tại', body: msg });
      } else {
        setModalContent({ type: 'error', title: 'Lỗi gửi email', body: msg || 'Vui lòng thử lại sau.' });
      }
      closeEmailModal();
      setModalOpen(true);
    }
  };

  const confirmCode = async () => {
    try {
      await axios.post('http://localhost:5000/api/confirm-email-code', {
        email: emailVerification.email,
        code: emailVerification.code,
      });
      closeEmailModal();
      await updateUser();
    } catch (err) {
      setModalContent({ type: 'error', title: 'Mã xác nhận sai', body: err.response?.data?.message || 'Thử lại.' });
      setModalOpen(true);
    }
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    localStorage.removeItem('otp_expiry');
    localStorage.removeItem('otp_email');
  };

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Hồ sơ cá nhân</h1>
      <div className="bg-white shadow-lg rounded-2xl p-6 flex items-start justify-between relative">
        <div className="flex items-center space-x-6">
          <div className="relative w-24 h-24 group">
            <input type="file" id="avatarUpload" accept="image/*" onChange={handleFileChange} className="hidden" />
            <label htmlFor="avatarUpload" className="cursor-pointer">
              <img
                src={formData.avatar ? URL.createObjectURL(formData.avatar) : user.avatar || "https://i.pravatar.cc/150?img=3"}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover border group-hover:opacity-90"
              />
            </label>
            {editing && (
              <label htmlFor="avatarUpload" className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow cursor-pointer hover:bg-gray-100" title="Đổi ảnh đại diện">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232a2.5 2.5 0 113.536 3.536L8 19.536H4v-4L15.232 5.232z" />
                </svg>
              </label>
            )}
          </div>
          <div>
            {editing ? (
              <>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Họ tên" className="w-full border rounded px-3 py-2 mb-2" />
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="w-full border rounded px-3 py-2" />
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </>
            )}
            <p className="text-gray-500 mt-1">Quyền: {user.role}</p>
            <p className="text-gray-400 mt-1 text-sm">ID: {user._id}</p>
          </div>
        </div>

        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="text-gray-500 hover:text-gray-700" title="Tùy chọn">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v.01M12 12v.01M12 18v.01" />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md z-10">
              <button onClick={() => { setEditing(true); setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">Chỉnh sửa hồ sơ</button>
            </div>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-6 flex space-x-3">
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Lưu thay đổi</button>
          <button onClick={() => setEditing(false)} className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded">Huỷ</button>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 text-center">
            <div className="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${modalContent.type === 'success' ? 'text-green-500' : modalContent.type === 'error' ? 'text-red-500' : 'text-orange-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <path strokeLinecap="round" strokeLinejoin="round" d={modalContent.type === 'success' ? 'M5 13l4 4L19 7' : modalContent.type === 'error' ? 'M6 18L18 6M6 6l12 12' : 'M12 8v4m0 4h.01'} />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{modalContent.title}</h2>
            {modalContent.body && <p className="text-gray-600 mb-4">{modalContent.body}</p>}
            <button onClick={() => setModalOpen(false)} className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg">OK</button>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Xác nhận email mới</h2>

            {emailVerification.step === 1 ? (
              <>
                <p className="text-sm text-gray-500 mb-4 text-center">
                  Gửi mã xác nhận đến <b>{emailVerification.email}</b>
                </p>
                <div className="text-center">
                  {countdown > 0 ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded bg-gray-400 text-white cursor-not-allowed"
                    >
                      Gửi lại ({countdown}s)
                    </button>
                  ) : (
                    <button
                      onClick={sendVerificationCode}
                      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Gửi mã
                    </button>
                  )}
                </div>
              </>
            ) : (

              <>
                <p className="text-sm text-gray-600 mb-2">
                  Nhập mã xác nhận đã gửi đến <b>{emailVerification.email}</b>
                </p>

                {countdown > 0 ? (
                  <p className="text-xs text-gray-500 mb-2">
                    Bạn có thể gửi lại mã sau <span className="font-semibold">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    onClick={sendVerificationCode}
                    className="text-sm text-blue-600 underline mb-2 hover:text-blue-800"
                  >
                    Gửi lại mã
                  </button>
                )}

                <input
                  type="text"
                  maxLength={6}
                  className="border rounded w-full p-2 mb-3"
                  value={emailVerification.code}
                  onChange={(e) => setEmailVerification({ ...emailVerification, code: e.target.value })}
                />

                <div className="flex justify-end space-x-3">
                  <button onClick={closeEmailModal} className="bg-gray-400 text-white px-4 py-2 rounded">Huỷ</button>
                  <button onClick={confirmCode} className="bg-green-600 text-white px-4 py-2 rounded">Xác nhận</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
