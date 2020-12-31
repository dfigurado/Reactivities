using Application.ImageMgt;
using Microsoft.AspNetCore.Http;

namespace Application.Interfaces
{
    public interface IImageAccessor
    {
         PhotoUploadResult AddPhoto(IFormFile file);
         string DeletePhoto(string publicId);
    }
}