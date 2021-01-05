using System.Net;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Exceptions;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System;

namespace Application.User
{
    public class RefreshToken
    {
        public class Command : IRequest<User>
        {
            public string RefreshToken { get; set; }
        }

        public class Handler : IRequestHandler<Command, User>
        {
            private readonly UserManager<AppUser> _userManager;
            private readonly IJwtGenerator _jwtGenerator;
            private readonly IUserAccessor _userAccessor;
            public Handler(UserManager<AppUser> userManager, IJwtGenerator jwtGenerator, IUserAccessor userAccessor)
            {
                _userAccessor = userAccessor;
                _jwtGenerator = jwtGenerator;
                _userManager = userManager;
            }

            public async Task<User> Handle(Command request, CancellationToken cancellationToken)
            {
                //Get the current logged in user
                var user = await _userManager.FindByNameAsync(_userAccessor.GetCurrentUsername());
                // Check if the previouly held refresh token (old token) is valid
                var oldToken = user.RefreshTokens.SingleOrDefault(x => x.Token == request.RefreshToken);
                // If not throw Application error 'Unauthorized'
                if (oldToken != null && !oldToken.IsActive)
                    throw new RestException(HttpStatusCode.Unauthorized);

                // Revoke the old token if having one
                if (oldToken != null)
                {
                    oldToken.Revoked = DateTime.UtcNow;
                }

                // Create a new refresh token
                var newRefreshToken = _jwtGenerator.GetRefreshToken();
                // Add the newly created refresh token to the user
                user.RefreshTokens.Add(newRefreshToken);
                // Update the user in database
                await _userManager.UpdateAsync(user);
                // Return the user with a new refresh token.
                return new User(user, _jwtGenerator, newRefreshToken.Token);
            }
        }
    }
}