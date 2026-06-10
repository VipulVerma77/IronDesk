import {
  AlertTriangle,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import Skeleton from '../../components/Common/Skeleton';
import AttendanceBadge from './AttendanceBadge';

const AttendanceTable = ({
  activeData,
  isLoading,
  isError,
  activeTab,
  page,
  setPage,
  setCheckOutRecord,
}) => {
  return (
    <>
      <div className="bg-white rounded-2xl border border-[#ECE4DC] shadow-sm overflow-hidden">
        <div className="grid grid-cols-5 px-6 py-4 border-b border-[#ECE4DC] bg-[#FAF7F4]">
          {[
            'Member',
            'Date',
            'Check In',
            'Check Out',
            'Action',
          ].map((heading) => (
            <p
              key={heading}
              className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide"
            >
              {heading}
            </p>
          ))}
        </div>

        {isLoading && (
          <div className="flex flex-col gap-3 p-6">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-14"
                />
              ))}
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <AlertTriangle
                size={32}
                className="text-[#C4956A] mx-auto mb-2"
              />

              <p className="text-sm font-medium text-[#2A1F1A]">
                Failed to load attendance
              </p>
            </div>
          </div>
        )}

        {!isLoading &&
          !isError &&
          (!activeData?.data ||
            activeData?.data.length === 0) && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 bg-[#FAF7F4] rounded-2xl flex items-center justify-center">
                <CalendarCheck
                  size={24}
                  className="text-[#C4956A]"
                />
              </div>

              <p className="text-sm font-medium text-[#2A1F1A]">
                {activeTab === 'today'
                  ? 'No attendance today'
                  : 'No records found'}
              </p>
            </div>
          )}

        {!isLoading &&
          !isError &&
          activeData?.data?.map((record) => (
            <div
              key={record.id}
              className="grid grid-cols-5 px-6 py-4 border-b border-[#ECE4DC] last:border-0 hover:bg-[#FAF7F4] items-center"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#C4956A] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {record.memberName
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </span>
                </div>

                <p className="text-sm font-medium text-[#2A1F1A]">
                  {record.memberName}
                </p>
              </div>

              <p className="text-sm text-[#6B6B6B]">
                {record.date
                  ? new Date(
                      record.date
                    ).toLocaleDateString('en-IN')
                  : '—'}
              </p>

              <p className="text-sm">
                {record.checkInTime
                  ? new Date(
                      record.checkInTime
                    ).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'}
              </p>

              <p className="text-sm">
                {record.checkOutTime
                  ? new Date(
                      record.checkOutTime
                    ).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'}
              </p>

              <div className="flex items-center gap-3">
                <AttendanceBadge
                  checkOutTime={
                    record.checkOutTime
                  }
                />

                {!record.checkOutTime && (
                  <button
                    onClick={() =>
                      setCheckOutRecord(record)
                    }
                    className="text-xs border border-[#1C1C1C] px-3 py-1.5 rounded-lg"
                  >
                    Check Out
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>

      {activeData &&
        activeData.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6B6B6B]">
              Page {activeData.currentPage} of{' '}
              {activeData.totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setPage((p) =>
                    Math.max(1, p - 1)
                  )
                }
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from(
                {
                  length:
                    activeData.totalPages,
                },
                (_, i) => i + 1
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() =>
                  setPage((p) =>
                    Math.min(
                      activeData.totalPages,
                      p + 1
                    )
                  )
                }
                disabled={
                  page ===
                  activeData.totalPages
                }
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
    </>
  );
};

export default AttendanceTable;