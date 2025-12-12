import React, { useState, useMemo } from 'react';
import { TIME_SLOTS, WEEK_DAYS } from '../constants';
import { StudentBooking, BookedSlot, ComputerId } from '../types';
import { Check, User, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Monitor, GraduationCap, X } from 'lucide-react';

interface PatientViewProps {
  bookings: StudentBooking[];
  onAddBooking: (booking: StudentBooking) => void;
}

export const PatientView: React.FC<PatientViewProps> = ({ bookings, onAddBooking }) => {
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null); // YYYY-MM-DD
  
  // Booking Selection State: Array of slots user wants to book
  // We use a temporary array for the current session
  const [selectedSlots, setSelectedSlots] = useState<BookedSlot[]>([]);

  // --- Calendar Logic ---
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const formatDateStr = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  // --- Booking Logic ---

  // Get all occupied slots from ALL students
  const occupiedSlots = useMemo(() => {
    const occupied = new Set<string>();
    bookings.forEach(student => {
        student.bookings.forEach(slot => {
            occupied.add(`${slot.date}-${slot.timeId}-${slot.computerId}`);
        });
    });
    return occupied;
  }, [bookings]);

  const isOccupied = (date: string, timeId: string, computerId: ComputerId) => {
    return occupiedSlots.has(`${date}-${timeId}-${computerId}`);
  };

  const isSelected = (date: string, timeId: string, computerId: ComputerId) => {
    return selectedSlots.some(s => s.date === date && s.timeId === timeId && s.computerId === computerId);
  };

  const handleSlotClick = (date: string, timeId: string, computerId: ComputerId) => {
    if (isOccupied(date, timeId, computerId)) return;

    setSelectedSlots(prev => {
        // Check if we already selected THIS specific computer
        const exists = prev.some(s => s.date === date && s.timeId === timeId && s.computerId === computerId);
        
        if (exists) {
            // Remove it
            return prev.filter(s => !(s.date === date && s.timeId === timeId && s.computerId === computerId));
        } else {
            // Add it, BUT first remove any other computer selected for THIS time slot (One computer per slot rule)
            const filtered = prev.filter(s => !(s.date === date && s.timeId === timeId));
            return [...filtered, { date, timeId, computerId }];
        }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSlots.length === 0) {
        alert('請至少選擇一個時段');
        return;
    }
    if (!name || !studentClass) {
        alert('請填寫 Name 與 Class');
        return;
    }

    const newBooking: StudentBooking = {
        id: crypto.randomUUID(),
        name,
        studentClass,
        bookings: selectedSlots,
        timestamp: Date.now()
    };

    onAddBooking(newBooking);
    setSubmitted(true);
  };

  // --- Rendering ---

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg max-w-lg mx-auto mt-10 animate-fade-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">預約成功！</h2>
        <p className="text-gray-600 text-center mb-6">
            您的時段已確認並登記至班表。
        </p>

        <div className="w-full bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            <h3 className="font-bold text-gray-700 border-b pb-2 mb-2">預約明細</h3>
            {selectedSlots.sort((a,b) => a.date.localeCompare(b.date) || a.timeId.localeCompare(b.timeId)).map((slot, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{slot.date} {slot.timeId}</span>
                    <span className="font-bold text-rose-500">電腦 {slot.computerId}</span>
                </div>
            ))}
        </div>

        <button 
          onClick={() => {
            setSubmitted(false);
            setName('');
            setStudentClass('');
            setSelectedSlots([]);
            setSelectedDateStr(null);
          }}
          className="text-rose-500 hover:text-rose-600 font-medium underline"
        >
          返回首頁
        </button>
      </div>
    );
  }

  // Render Slots for Selected Date
  const renderTimeSlots = () => {
    if (!selectedDateStr) return null;
    
    const dateObj = new Date(selectedDateStr);
    const dayOfWeek = dateObj.getDay(); // 0=Sun, 6=Sat
    
    // Determine which slots to show
    // Mon(1) - Fri(5): PM Slots
    // Sat(6): AM Slots
    // Sun(0): None (or handled if needed)
    
    let relevantSlots = [];
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        relevantSlots = TIME_SLOTS.filter(t => t.period === 'PM');
    } else if (dayOfWeek === 6) {
        relevantSlots = TIME_SLOTS.filter(t => t.period === 'AM');
    } else {
        return (
            <div className="p-8 text-center text-gray-400">
                週日不開放預約
            </div>
        );
    }

    return (
        <div className="space-y-3">
             <div className="sticky top-0 bg-white z-10 py-2 border-b flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg text-gray-800">
                    {selectedDateStr} ({WEEK_DAYS[dayOfWeek]})
                </h3>
                <button onClick={() => setSelectedDateStr(null)} className="text-sm text-gray-500 hover:text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                    關閉
                </button>
             </div>
             
             <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto pr-2">
                {relevantSlots.map(slot => (
                    <div key={slot.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <span className="font-bold text-gray-700 w-16">{slot.label}</span>
                        <div className="flex gap-2 flex-1 justify-end">
                            {['A', 'B', 'C'].map(comp => {
                                const compId = comp as ComputerId;
                                const occupied = isOccupied(selectedDateStr, slot.id, compId);
                                const selected = isSelected(selectedDateStr, slot.id, compId);
                                
                                return (
                                    <button
                                        key={comp}
                                        type="button"
                                        disabled={occupied}
                                        onClick={() => handleSlotClick(selectedDateStr, slot.id, compId)}
                                        className={`
                                            w-10 h-10 rounded-full font-bold text-sm transition-all flex items-center justify-center
                                            ${occupied 
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                                : selected
                                                    ? 'bg-[#fed7dd] text-gray-900 shadow-md scale-105 border border-rose-200'
                                                    : 'bg-white border-2 border-[#fed7dd] text-gray-600 hover:bg-[#fff0f3] hover:border-rose-200'
                                            }
                                        `}
                                    >
                                        {comp}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
             </div>
        </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-xl border-t-4 border-[#fed7dd] min-h-[80vh]">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Monitor className="w-7 h-7 text-[#f472b6]" />
          Sesame Street School 補課預約
        </h1>
        <p className="text-gray-500 text-sm mt-1">請選擇日期與時段，A/B/C 代表不同電腦座位。</p>
      </header>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-[#fff0f3] p-4 rounded-xl">
        <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
            <User className="w-4 h-4 mr-2" /> Name
            </label>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fed7dd] outline-none bg-white"
                placeholder="輸入姓名"
            />
        </div>
        <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
            <GraduationCap className="w-4 h-4 mr-2" /> Class
            </label>
            <input
                type="text"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fed7dd] outline-none bg-white"
                placeholder="輸入班級"
            />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Calendar */}
        <div className="w-full md:w-1/2">
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#fed7dd] p-4 flex justify-between items-center">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-white/30 rounded-full"><ChevronLeft className="w-5 h-5 text-gray-800"/></button>
                    <span className="font-bold text-gray-800 text-lg">{year}年 {month + 1}月</span>
                    <button onClick={handleNextMonth} className="p-1 hover:bg-white/30 rounded-full"><ChevronRight className="w-5 h-5 text-gray-800"/></button>
                </div>
                <div className="grid grid-cols-7 text-center p-2 text-xs font-bold text-gray-400 border-b">
                    {WEEK_DAYS.map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 p-2">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = formatDateStr(year, month, day);
                        const isSelectedDate = selectedDateStr === dateStr;
                        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                        const dayOfWeek = new Date(year, month, day).getDay();
                        const isSunday = dayOfWeek === 0;

                        // Check if user has selected slots on this day
                        const hasUserSelection = selectedSlots.some(s => s.date === dateStr);

                        return (
                            <button
                                key={day}
                                disabled={isSunday}
                                onClick={() => setSelectedDateStr(dateStr)}
                                className={`
                                    h-10 w-full rounded-lg text-sm font-medium transition-all relative
                                    ${isSelectedDate 
                                        ? 'bg-[#fed7dd] text-gray-900 shadow-md font-bold' 
                                        : isSunday 
                                            ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
                                            : 'hover:bg-[#fff0f3] text-gray-700'
                                    }
                                    ${isToday && !isSelectedDate ? 'border border-[#fed7dd] font-bold text-rose-500' : ''}
                                `}
                            >
                                {day}
                                {hasUserSelection && (
                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Summary */}
            {selectedSlots.length > 0 && (
                <div className="mt-4 bg-[#fff0f3] p-4 rounded-xl border border-[#fed7dd]">
                    <h3 className="font-bold text-gray-800 text-sm mb-2">已選擇的時段 ({selectedSlots.length})</h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedSlots.map((s, i) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-white border border-[#fed7dd] text-gray-700 px-2 py-1 rounded text-xs font-bold shadow-sm">
                                {s.date.slice(5)} {s.timeId} ({s.computerId})
                                <button 
                                    onClick={() => handleSlotClick(s.date, s.timeId, s.computerId)}
                                    className="hover:bg-rose-100 rounded-full p-0.5"
                                >
                                    <X className="w-3 h-3 text-rose-500"/>
                                </button>
                            </span>
                        ))}
                    </div>
                    <button 
                        onClick={handleSubmit}
                        className="mt-4 w-full bg-[#fed7dd] hover:bg-[#fcc2c9] text-gray-900 font-bold py-3 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
                    >
                        <Check className="w-5 h-5" />
                        確認提交
                    </button>
                </div>
            )}
        </div>

        {/* Right: Slot Selection Grid (Mobile: Overlay, Desktop: Side) */}
        <div className={`
            fixed inset-0 z-50 bg-white p-4 transition-transform duration-300 md:static md:bg-transparent md:p-0 md:w-1/2 md:block md:translate-x-0
            ${selectedDateStr ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}>
            {selectedDateStr ? (
                renderTimeSlots()
            ) : (
                <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <CalendarIcon className="w-12 h-12 mb-2 opacity-20" />
                    <p>請點選左側日期查看時段</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};