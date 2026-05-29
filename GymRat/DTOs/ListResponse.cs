namespace GymRat.DTOs
{
    public class ListResponse<T>
    {
        public List<T> Data { get; set; } = new();

        public int CurrentPage { get; set; }

        public int PageSize { get; set; }

        public int TotalCount { get; set; }

        public int TotalPages { get; set; }
    }
}