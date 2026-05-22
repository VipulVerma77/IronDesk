using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymRat.Migrations
{
    /// <inheritdoc />
    public partial class AddSlugToGym : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "Gyms",
                type: "varchar(255)",
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Gyms_Slug",
                table: "Gyms",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Gyms_Slug",
                table: "Gyms");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "Gyms");
        }
    }
}
