namespace GymRat.DTOs
{
    public class ApiResponse<T>
    {
        public string Status  { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }

        public bool IsSuccess => Status == "success";

        public static ApiResponse<T> Success(String message, T data)
        {
            return new ApiResponse<T> { 
                Status = "success",
                Message = message,
                Data = data
            };
        }

        public static ApiResponse<T> Fail(String message)
        {
            return new ApiResponse<T>
            {
                Status = "fail",
                Message = message,
                Data = default
            };
        }
    }
}
