import { useState, useEffect } from 'react';
import { adminAPI } from '../lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Session {
  _id: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: string;
  sessionType: string;
  clientId: {
    userId: {
      firstName: string;
      lastName: string;
    };
  };
  therapistId: {
    userId: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, [currentDate]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      // Fetch all sessions (you could filter by month if the API supports it, but since it's an admin panel we'll just fetch them and filter locally)
      const response = await adminAPI.getSessions({});
      setSessions(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const { days, firstDay } = getDaysInMonth(currentDate);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const renderCells = () => {
    const cells = [];
    let day = 1;

    for (let i = 0; i < 42; i++) {
      if (i < firstDay || day > days) {
        cells.push(<div key={`empty-${i}`} className="bg-gray-50 border border-gray-200 min-h-[120px]"></div>);
      } else {
        const currentDateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
        const daySessions = sessions.filter(s => {
          if (!s.scheduledDate) return false;
          return new Date(s.scheduledDate).toISOString().split('T')[0] === currentDateStr;
        });

        cells.push(
          <div key={`day-${day}`} className="bg-white border border-gray-200 min-h-[120px] p-2 hover:bg-gray-50 transition-colors cursor-pointer overflow-y-auto">
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm font-semibold ${new Date().toISOString().split('T')[0] === currentDateStr ? 'bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-700'}`}>
                {day}
              </span>
              {daySessions.length > 0 && (
                <span className="text-xs text-gray-400 font-medium">{daySessions.length} {daySessions.length === 1 ? 'session' : 'sessions'}</span>
              )}
            </div>
            <div className="space-y-1 mt-2">
              {daySessions.map(session => (
                <div 
                  key={session._id} 
                  className={`text-xs p-1.5 rounded truncate ${
                    session.status === 'completed' ? 'bg-green-100 text-green-800' :
                    session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-indigo-100 text-indigo-800'
                  }`}
                  title={`${session.scheduledTime} - ${session.clientId?.userId?.firstName} & ${session.therapistId?.userId?.firstName}`}
                >
                  <div className="font-semibold">{session.scheduledTime}</div>
                  <div className="truncate">{session.clientId?.userId?.firstName} (C)</div>
                  <div className="truncate">{session.therapistId?.userId?.firstName} (T)</div>
                </div>
              ))}
            </div>
          </div>
        );
        day++;
      }
    }
    return cells;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Calendar</h1>
          <p className="text-gray-600 mt-2">View all scheduled sessions across the platform</p>
        </div>
        <div className="flex items-center space-x-4 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 min-w-[150px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}
        
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {dayNames.map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {renderCells()}
        </div>
      </div>
    </div>
  );
}
