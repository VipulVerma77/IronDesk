using GymRat.DTOs;

namespace GymRat.Services.Interfaces
{
    public interface IMemberService
    {
        Task<ApiResponse<MemberResponseDto>> AddMemberAsync(MemberDto memberDto, int gymId);

        Task<ApiResponse<ListResponse<MemberResponseDto>>> GetAllMembersAsync(
            int gymId,
            int pageNumber,
            int pageSize);
    }
}