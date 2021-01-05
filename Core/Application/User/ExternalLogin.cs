using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Exceptions;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.User
{
    public class ExternalLogin
    {
        public class Query : IRequest<User>
        {
            public string AccessToken { get; set; }
        }

        public class Handler : IRequestHandler<Query, User>
        {
            private readonly UserManager<AppUser> _userManager;
            private readonly IFacebookAccessor _facebookAccessor;
            private readonly IJwtGenerator _jwtGenerator;
            public Handler(UserManager<AppUser> userManager, IFacebookAccessor facebookAccessor, IJwtGenerator jwtGenerator)
            {
                _jwtGenerator = jwtGenerator;
                _facebookAccessor = facebookAccessor;
                _userManager = userManager;
            }

            public async Task<User> Handle(Query request, CancellationToken cancellationToken)
            {
                // handler logic goes here
                var userInfo = await _facebookAccessor.FacebookLogin(request.AccessToken);

                if (userInfo == null)
                    throw new RestException(HttpStatusCode.BadRequest, new { User = "Problem validating token" });

                var user = await _userManager.FindByEmailAsync(userInfo.Email);
                var refreshToken = _jwtGenerator.GetRefreshToken();

                if (user != null)
                {
                    user.RefreshTokens.Add(refreshToken);
                    await _userManager.UpdateAsync(user);
                    return new User(user, _jwtGenerator, refreshToken.Token);
                }

                    user = new AppUser
                    {
                        DisplayName = userInfo.Name,
                        Id = userInfo.Id,
                        Email = userInfo.Email,
                        UserName = "fb_" + userInfo.Id,
                        EmailConfirmed = true
                    };

                    var photo = new Photo
                    {
                        Id = "fb_" + userInfo.Id,
                        Url = userInfo.Picture.Data.Url,
                        IsMain = true
                    };

                    user.Photos.Add(photo);
                    user.RefreshTokens.Add(refreshToken);

                    var result = await _userManager.CreateAsync(user);

                    if (!result.Succeeded)
                        throw new RestException(HttpStatusCode.BadRequest, new { User = "Can't create user" });
                

                return new User(user, _jwtGenerator, refreshToken.Token);
            }
        }
    }
}