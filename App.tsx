import React, { useState, useEffect } from 'react';
import { PatientView } from './components/PatientView';
import { TherapistView } from './components/TherapistView';
import { StudentBooking } from './types';
import { UserCircle, LayoutDashboard, LogOut, Lock, KeyRound, X } from 'lucide-react';

const App: React.FC = () => {
  // Default to patient, or 'therapist' if logged in/selected
  const [role, setRole] = useState<'patient' | 'therapist'>('patient');
  
  // Initialize bookings from LocalStorage
  const [bookings, setBookings] = useState<StudentBooking[]>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('luji_bookings');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse bookings from storage", e);
            }
        }
    }
    return [];
  });
  
  // Auth state
  const [storedPassword, setStoredPassword] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('luji_therapist_pwd') || '1234';
    }
    return '1234';
  });
  const [therapistPassword, setTherapistPassword] = useState('');
  const [isTherapistAuthenticated, setIsTherapistAuthenticated] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Persist bookings
  useEffect(() => {
    localStorage.setItem('luji_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const handleAddBooking = (newBooking: StudentBooking) => {
    setBookings(prev => [...prev, newBooking]);
  };

  const attemptTherapistLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (therapistPassword === storedPassword) {
        setIsTherapistAuthenticated(true);
    } else {
        alert('密碼錯誤');
        setTherapistPassword('');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
        alert('兩次輸入的密碼不相符');
        return;
    }
    if (newPassword.length < 4) {
        alert('密碼長度至少需 4 碼');
        return;
    }
    
    setStoredPassword(newPassword);
    localStorage.setItem('luji_therapist_pwd', newPassword);
    alert('密碼修改成功！');
    setShowPasswordModal(false);
    setNewPassword('');
    setConfirmNewPassword('');
  };

  // Therapist (Teacher) Login Screen
  if (role === 'therapist' && !isTherapistAuthenticated) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
             <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#BCD4E6]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-[#5C8AA6]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Teacher Login</h2>
                    <p className="text-gray-500 text-sm mt-2">請輸入管理密碼以繼續</p>
                </div>
                <form onSubmit={attemptTherapistLogin} className="space-y-4">
                    <input 
                        type="password"
                        value={therapistPassword}
                        onChange={(e) => setTherapistPassword(e.target.value)}
                        placeholder="請輸入密碼"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BCD4E6] focus:border-transparent outline-none"
                        autoFocus
                    />
                    <div className="flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setRole('patient')}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                        >
                            返回
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 px-4 py-3 bg-[#BCD4E6] text-slate-800 rounded-lg hover:bg-[#A9CBE0] font-medium shadow-md transition-colors"
                        >
                            登入
                        </button>
                    </div>
                </form>
             </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className={`shadow-md z-50 ${role === 'patient' ? 'bg-[#fed7dd]' : 'bg-[#BCD4E6]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
               {role === 'patient' ? <UserCircle className="text-gray-700 w-6 h-6" /> : <LayoutDashboard className="text-slate-700 w-6 h-6" />}
               <span className="text-gray-800 font-bold text-lg tracking-wide">
                 {role === 'patient' ? 'Sesame Street School 補課預約' : 'Teacher Schedule'}
               </span>
            </div>
            <div className="flex items-center gap-2">
                {role === 'patient' && (
                    <button 
                        onClick={() => setRole('therapist')}
                        className="text-xs bg-white/40 text-gray-800 hover:bg-white/60 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                        Teacher Login
                    </button>
                )}
                {role === 'therapist' && isTherapistAuthenticated && (
                    <button 
                        onClick={() => setShowPasswordModal(true)}
                        className="flex items-center gap-2 transition-colors px-3 py-1.5 rounded-lg text-sm font-medium mr-2 text-slate-600 hover:text-slate-900 bg-white/50 hover:bg-white/80"
                    >
                        <KeyRound className="w-4 h-4" />
                        <span className="hidden md:inline">修改密碼</span>
                    </button>
                )}
                {role === 'therapist' && (
                    <button 
                        onClick={() => {
                            setRole('patient');
                            setIsTherapistAuthenticated(false);
                            setTherapistPassword('');
                        }}
                        className="flex items-center gap-2 transition-colors px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 bg-white/50 hover:bg-white/80"
                    >
                        <LogOut className="w-4 h-4" />
                        登出
                    </button>
                )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto py-8">
        {role === 'patient' ? (
          <PatientView 
            bookings={bookings}
            onAddBooking={handleAddBooking}
          />
        ) : (
          <TherapistView bookings={bookings} />
        )}
      </main>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all scale-100 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-[#5C8AA6]" />
                        修改管理密碼
                    </h3>
                    <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">新密碼</label>
                        <input 
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BCD4E6] outline-none"
                            placeholder="請輸入新密碼"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">確認新密碼</label>
                        <input 
                            type="password"
                            required
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BCD4E6] outline-none"
                            placeholder="請再次輸入新密碼"
                        />
                    </div>
                    <div className="pt-2 flex gap-3">
                        <button 
                            type="button"
                            onClick={() => setShowPasswordModal(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            取消
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 px-4 py-2 bg-[#BCD4E6] text-slate-800 rounded-lg hover:bg-[#A9CBE0] font-medium transition-colors"
                        >
                            確認修改
                        </button>
                    </div>
                </form>
             </div>
        </div>
      )}
    </div>
  );
};

export default App;