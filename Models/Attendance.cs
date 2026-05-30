namespace GymRat.Models
{
    public class Attendance
    {
        public int Id { get; set; }

        public int MemberId { get; set; }
        public Member Member { get; set; }

        public int GymId { get; set; }
        public Gym Gym { get; set; }

        public DateTime CheckInTime { get; set; }

        public DateTime? CheckOutTime { get; set; }

        public DateOnly Date { get; set; }
    }
}