import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LogIn } from 'lucide-react';

import {
  getTodayAttendanceAPI,
  getAttendanceByRangeAPI,
} from '../../features/attendance/attendanceAPI';

import AttendanceStats from './AttendanceStats';
import AttendanceFilters from './AttendanceFilters';
import AttendanceTable from './AttendanceTable';
import CheckInModal from './CheckInModal';
import CheckOutModal from './CheckOutModal';

const tabs = [
  {
    id: 'today',
    label: "Today's Attendance",
  },
  {
    id: 'range',
    label: 'Date Range',
  },
];

const Attendance = () => {
  const [activeTab, setActiveTab] = useState('today');
  const [page, setPage] = useState(1);

  const [showCheckIn, setShowCheckIn] =
    useState(false);

  const [checkOutRecord, setCheckOutRecord] =
    useState(null);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [rangeError, setRangeError] =
    useState(null);

  const pageSize = 10;

  const {
    data: todayData,
    isLoading: todayLoading,
    isError: todayError,
  } = useQuery({
    queryKey: ['attendance-today', page],

    queryFn: async () => {
      const res = await getTodayAttendanceAPI(
        page,
        pageSize
      );

      return res.data.data;
    },

    enabled: activeTab === 'today',
    staleTime: 1000 * 30,
  });

  const {
    data: rangeData,
    isLoading: rangeLoading,
    isError: rangeError2,
    refetch: refetchRange,
  } = useQuery({
    queryKey: [
      'attendance-range',
      fromDate,
      toDate,
      page,
    ],

    queryFn: async () => {
      const res =
        await getAttendanceByRangeAPI(
          fromDate,
          toDate,
          page,
          pageSize
        );

      return res.data.data;
    },

    enabled: false,
    staleTime: 1000 * 60,
  });

  const handleRangeSearch = () => {
    if (!fromDate || !toDate) {
      setRangeError('Both dates are required');
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      setRangeError(
        'From date cannot be after To date'
      );
      return;
    }

    setRangeError(null);
    setPage(1);
    refetchRange();
  };

  const activeData =
    activeTab === 'today'
      ? todayData
      : rangeData;

  const isLoading =
    activeTab === 'today'
      ? todayLoading
      : rangeLoading;

  const isError =
    activeTab === 'today'
      ? todayError
      : rangeError2;

  return (
    <>
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-black text-[#2A1F1A]"
              style={{
                fontFamily:
                  "'Playfair Display', serif",
              }}
            >
              Attendance
            </h1>

            <p className="text-sm text-[#6B6B6B] mt-1">
              Track member check ins and
              check outs
            </p>
          </div>

          <button
            onClick={() =>
              setShowCheckIn(true)
            }
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1C1C1C] text-white rounded-xl text-sm font-medium hover:bg-[#333] transition-colors cursor-pointer"
          >
            <LogIn size={16} />
            Check In Member
          </button>
        </div>

        {/* Stats */}
        <AttendanceStats
          todayData={todayData}
        />

        {/* Tabs */}
        <div className="flex gap-2 bg-[#ECE4DC]/50 rounded-2xl p-1.5 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-[#2A1F1A] shadow-sm'
                  : 'text-[#6B6B6B] hover:text-[#2A1F1A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        {activeTab === 'range' && (
          <AttendanceFilters
            fromDate={fromDate}
            toDate={toDate}
            setFromDate={setFromDate}
            setToDate={setToDate}
            handleRangeSearch={
              handleRangeSearch
            }
            rangeError={rangeError}
          />
        )}

        {/* Table */}
        <AttendanceTable
          activeData={activeData}
          isLoading={isLoading}
          isError={isError}
          activeTab={activeTab}
          page={page}
          setPage={setPage}
          setCheckOutRecord={
            setCheckOutRecord
          }
        />
      </div>

      {showCheckIn && (
        <CheckInModal
          onClose={() =>
            setShowCheckIn(false)
          }
        />
      )}

      {checkOutRecord && (
        <CheckOutModal
          record={checkOutRecord}
          onClose={() =>
            setCheckOutRecord(null)
          }
        />
      )}
    </>
  );
};

export default Attendance;