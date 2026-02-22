import { Calendar as CalendarIcon } from 'lucide-react';

export default function Calendar() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
                <p className="text-gray-600 mt-2">Manage appointments and schedules</p>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
                <div className="bg-indigo-50 p-4 rounded-full mb-4">
                    <CalendarIcon className="w-12 h-12 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Calendar Feature Coming Soon</h2>
                <p className="text-gray-500 max-w-md">
                    The integrated scheduling and calendar management system is currently under development.
                    Check back later for updates.
                </p>
            </div>
        </div>
    );
}
