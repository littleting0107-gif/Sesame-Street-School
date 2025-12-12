import React, { useState, useEffect } from 'react';
import { PatientView } from './components/PatientView';
import { TherapistView } from './components/TherapistView';
import { StudentBooking } from './types';
import { UserCircle, LayoutDashboard, LogOut } from 'lucide-react';

const App: React.FC = () => {
  // Default to patient, or 'therapist' if selected
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

  // Persist bookings
  useEffect(() => {
    localStorage.setItem('luji_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const handleAddBooking = (newBooking: StudentBooking) => {
    setBookings(prev => [...prev, newBooking]);
  };

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
                        Teacher View
                    </button>
                )}
                {role === 'therapist' && (
                    <button 
                        onClick={() => setRole('patient')}
                        className="flex items-center gap-2 transition-colors px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 bg-white/50 hover:bg-white/80"
                    >
                        <LogOut className="w-4 h-4" />
                        返回預約
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
    </div>
  );
};

export default App;