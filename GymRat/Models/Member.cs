namespace GymRat.Models
{
    public class Member
    {
     public int Id { get; set; }
     public required string  FullName {get;set;}
     public required string Email{get;set;}
     public required string Phone{get;set;} 
     public required string Address{get;set;} 
     public required DateTime JoinDate{get;set;}
     public required string Status{get;set;} = "Inactive";
     public int GymId{get;set;}
     public  Gym?Gym {get;set;}
     public int UserId { get; set; }
     public User? User { get; set; }
    }
}