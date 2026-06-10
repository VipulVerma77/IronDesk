import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  X,
  AlertTriangle,
} from 'lucide-react';

import { checkInAPI } from '../../features/attendance/attendanceAPI';
import { getAllMembersAPI } from '../../features/member/memberAPI';
import Skeleton from '../../components/Common/Skeleton';

const CheckInModal = ({ onClose }) => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [apiError, setApiError] = useState(null);
  const [successId, setSuccessId] = useState(null);

  const { data: members, isLoading } = useQuery({
    queryKey: ['members-checkin'],

    queryFn: async () => {
      const res = await getAllMembersAPI(1, 100);
      return res.data.data?.data;
    },
  });

  const mutation = useMutation({
    mutationFn: (memberId) => checkInAPI(memberId),

    onSuccess: (data) => {
      if (data.data.isSuccess) {
        queryClient.invalidateQueries({
          queryKey: ['attendance-today'],
        });

        setSuccessId(data.data.data?.memberId);
        setApiError(null);
      } else {
        setApiError(data.data.message);
      }
    },

    onError: () => {
      setApiError('Something went wrong.');
    },
  });

  const filtered =
    members?.filter(
      (member) =>
        member.fullName
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        member.email
          .toLowerCase()
          .includes(search.toLowerCase())
    ) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-[#ECE4DC] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3
              className="text-lg font-black text-[#2A1F1A]"
              style={{
                fontFamily:
                  "'Playfair Display', serif",
              }}
            >
              Check In Member
            </h3>

            <p className="text-xs text-[#6B6B6B]">
              Select an active member to check in
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F4] flex items-center justify-center hover:bg-[#ECE4DC] transition-colors cursor-pointer"
          >
            <X
              size={16}
              className="text-[#6B6B6B]"
            />
          </button>
        </div>

        {apiError && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <AlertTriangle
              size={16}
              className="text-red-500 flex-shrink-0"
            />

            <p className="text-sm text-red-600">
              {apiError}
            </p>
          </div>
        )}

        <div className="relative mb-3">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
          />

          <input
            type="text"
            placeholder="Search member..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ECE4DC] bg-[#FAF7F4] text-sm text-[#2A1F1A] placeholder:text-[#9B9B9B] outline-none focus:border-[#1C1C1C]"
          />
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto flex-1">
          {isLoading &&
            Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-14"
                />
              ))}

          {!isLoading &&
            filtered.length === 0 && (
              <p className="text-sm text-[#6B6B6B] text-center py-8">
                No members found
              </p>
            )}

          {!isLoading &&
            filtered.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#ECE4DC] hover:bg-[#FAF7F4]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#C4956A] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {member.fullName
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[#2A1F1A]">
                      {member.fullName}
                    </p>

                    <p className="text-xs text-[#6B6B6B]">
                      {member.status}
                    </p>
                  </div>
                </div>

                {successId === member.id ? (
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-medium">
                    ✓ Checked In
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setApiError(null);
                      setSuccessId(null);

                      mutation.mutate(member.id);
                    }}
                    disabled={
                      mutation.isPending ||
                      member.status !== 'Active'
                    }
                    className="text-xs bg-[#1C1C1C] text-white px-3 py-1.5 rounded-lg disabled:opacity-40"
                  >
                    Check In
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CheckInModal;