namespace GymRat.DTOs.Attendance
{
    public class AttendanceResponseDto
    {
        public int Id { get; set; }

        public int MemberId { get; set; }

        public string MemberName { get; set; }

        public DateOnly Date { get; set; }

        public DateTime CheckInTime { get; set; }

        public DateTime? CheckOutTime { get; set; }
    }
}