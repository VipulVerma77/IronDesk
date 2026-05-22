namespace GymRat.DTOs
{
    public class MemberResponseDto
    {
        public required int Id { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Phone { get; set; }
        public required string Address { get; set; }
        public required string Status { get; set; }
        public required DateTime JoinDate { get; set; }
    }
}