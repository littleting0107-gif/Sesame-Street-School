import React, { useState, useMemo } from 'react';
import { TIME_SLOTS, WEEK_DAYS } from '../constants';
import { StudentBooking, ComputerId } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Monitor, Users } from 'lucide-react';

interface TherapistViewProps {
  bookings: StudentBooking[];
}

export const TherapistView: React.FC<TherapistViewProps> = ({ bookings }) => {
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date()); // The date selected to view schedule

  // --- Calendar Helpers ---
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const formatDateStr = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // --- Schedule Logic ---
  // Given a viewDate, calculate the week (Mon - Sat)
  const getWeekRange = (date: Date) => {
    const day = date.getDay(); // 0-6
    const diffToMon = day === 0 ? -6 : 1 - day; // If Sun, go back 6 days. Else go back to 1.
    
    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMon);
    
    const week = [];
    for (let i = 0; i < 6; i++) { // Mon to Sat (6 days)
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        week.push(d);
    }
    return week;
  };

  const currentWeek = useMemo(() => getWeekRange(viewDate), [viewDate]);
  
  // Split week into Weekdays (Mon-Fri) and Saturday
  const weekDays = useMemo(() => currentWeek.slice(0, 5), [currentWeek]);
  const saturday = useMemo(() => currentWeek[5], [currentWeek]);

  // Transform bookings into a map for easy lookup: Key="YYYY-MM-DD_TimeId_ComputerId" -> StudentName
  const bookingMap = useMemo(() => {
    const map = new Map<string, { name: string, class: string }>();
    bookings.forEach(student => {
        student.bookings.forEach(slot => {
            const key = `${slot.date}_${slot.timeId}_${slot.computerId}`;
            map.set(key, { name: student.name, class: student.studentClass });
        });
    });
    return map;
  }, [bookings]);

  const weekdaySlots = TIME_SLOTS.filter(s => s.period === 'PM');
  const saturdaySlots = TIME_SLOTS.filter(s => s.period === 'AM');

  const renderCell = (date: Date, slotId: string) => {
      const dateStr = formatDateStr(date);
      return (
        <td key={dateStr} className="p-1 border-r align-top">
            <div className="flex flex-col gap-1 justify-center">
                {['A', 'B', 'C'].map(c => {
                    const compId = c as ComputerId;
                    const key = `${dateStr}_${slotId}_${compId}`;
                    const booking = bookingMap.get(key);
                    
                    let style = 'bg-gray-50 border-gray-100 text-gray-300';
                    if (booking) {
                        if (compId === 'A') style = 'bg-rose-100 border-rose-200 text-rose-800';
                        if (compId === 'B') style = 'bg-sky-100 border-sky-200 text-sky-800';
                        if (compId === 'C') style = 'bg-emerald-100 border-emerald-200 text-emerald-800';
                    } else {
                            if (compId === 'A') style = 'bg-rose-50/50 border-rose-100 text-rose-200';
                            if (compId === 'B') style = 'bg-sky-50/50 border-sky-100 text-sky-200';
                            if (compId === 'C') style = 'bg-emerald-50/50 border-emerald-100 text-emerald-200';
                    }

                    return (
                        <div key={compId} className={`text-xs px-2 py-0.5 rounded border flex justify-between items-center ${style} ${booking ? 'shadow-sm' : ''} h-9`}>
                            <span className="font-bold text-sm shrink-0">{compId}</span>
                            <div className="flex flex-col text-right overflow-hidden ml-1 w-full justify-center leading-tight">
                                <span className="truncate font-bold block">{booking ? booking.name : '-'}</span>
                                {booking && <span className="truncate text-[10px] opacity-80 block">{booking.class}</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </td>
      );
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 max-w-7xl mx-auto p-4 md:p-6">
      
      {/* Sidebar: Calendar */}
      <div className="w-full md:w-80 flex-shrink-0 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden h-fit">
        <div className="p-4 bg-[#BCD4E6] flex justify-between items-center">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-white/20 rounded-full text-slate-800"><ChevronLeft className="w-5 h-5"/></button>
            <span className="font-bold text-slate-800 text-lg">{year}年 {month + 1}月</span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-white/20 rounded-full text-slate-800"><ChevronRight className="w-5 h-5"/></button>
        </div>
        <div className="grid grid-cols-7 text-center p-2 text-xs font-bold text-gray-500 border-b bg-gray-50">
            {WEEK_DAYS.map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 p-2">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateObj = new Date(year, month, day);
                const dateStr = formatDateStr(dateObj);
                // Check if current view week contains this day
                const isInViewWeek = currentWeek.some(d => d.toDateString() === dateObj.toDateString());
                const isSunday = dateObj.getDay() === 0;

                return (
                    <button
                        key={day}
                        disabled={isSunday}
                        onClick={() => setViewDate(dateObj)}
                        className={`
                            h-10 w-full rounded-lg text-sm font-medium transition-all relative
                            ${isInViewWeek 
                                ? 'bg-[#5C8AA6] text-white shadow-md' 
                                : isSunday
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'hover:bg-[#BCD4E6]/50 text-gray-700'
                            }
                        `}
                    >
                        {day}
                    </button>
                );
            })}
        </div>
        <div className="p-4 border-t bg-gray-50">
            <p className="text-xs text-gray-500 text-center">點選日期以查看該週班表</p>
        </div>
      </div>

      {/* Main Content: Weekly Schedule */}
      <div className="flex-1 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden h-[85vh]">
         <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-[#5C8AA6]" />
                班表 ({formatDateStr(currentWeek[0])} ~ {formatDateStr(currentWeek[5])})
            </h2>
            <div className="flex gap-2 text-xs font-bold text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-rose-100 border border-rose-200 rounded"></span> 電腦 A</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-sky-100 border border-sky-200 rounded"></span> 電腦 B</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-100 border border-emerald-200 rounded"></span> 電腦 C</span>
            </div>
         </div>

         <div className="overflow-auto flex-1 p-4 bg-slate-50">
             <div className="flex flex-col xl:flex-row gap-6 items-start">
                 
                 {/* Table 1: Weekdays (PM) */}
                 <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
                     <div className="p-3 bg-gray-50 border-b font-bold text-gray-700">週一至週五 (PM)</div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-2 border-b border-r bg-white sticky left-0 z-10 w-16 text-center text-gray-500">時段</th>
                                    {weekDays.map(date => (
                                        <th key={date.toISOString()} className="p-2 border-b min-w-[120px] text-center bg-gray-50/50">
                                            <div className="font-bold text-gray-800">{WEEK_DAYS[date.getDay()]}</div>
                                            <div className="text-xs text-gray-500">{formatDateStr(date)}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {weekdaySlots.map(slot => (
                                    <tr key={slot.id} className="hover:bg-gray-50/50">
                                        <td className="p-2 border-r text-center font-bold text-gray-500 sticky left-0 bg-white">{slot.label}</td>
                                        {weekDays.map(date => renderCell(date, slot.id))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                 </div>

                 {/* Table 2: Saturday (AM) */}
                 <div className="w-full xl:w-64 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                     <div className="p-3 bg-teal-50 border-b font-bold text-teal-800">週六 (AM)</div>
                     <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="p-2 border-b border-r bg-white w-16 text-center text-gray-500">時段</th>
                                <th className="p-2 border-b text-center bg-teal-50/30">
                                    <div className="font-bold text-teal-900">Sat</div>
                                    <div className="text-xs text-teal-600">{formatDateStr(saturday)}</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {saturdaySlots.map(slot => (
                                <tr key={slot.id} className="hover:bg-teal-50/10">
                                    <td className="p-2 border-r text-center font-bold text-gray-500">{slot.label}</td>
                                    {renderCell(saturday, slot.id)}
                                </tr>
                            ))}
                        </tbody>
                     </table>
                 </div>

             </div>
         </div>
      </div>
    </div>
  );
};