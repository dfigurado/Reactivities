using System.Threading.Tasks;

namespace Application.Profiles.Interfaces
{
    public interface IProfileReader
    {
         Task<Profile> ReadProfile(string username);
    }
}