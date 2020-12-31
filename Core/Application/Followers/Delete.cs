using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Exceptions;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Followers
{
    public class Delete
    {
        public class Command : IRequest
        {
            public string Username { get; set; }
        }

        public class Handler : IRequestHandler<Command>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;
            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _userAccessor = userAccessor;
                _context = context;
            }

            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {
                // The observer will always be the currently logged in user.
                var observer = await _context.Users.SingleOrDefaultAsync(x => x.UserName == _userAccessor.GetCurrentUsername());

                // The user whom the 'Current user' wants to follow.
                var target = await _context.Users.SingleOrDefaultAsync(x => x.UserName == request.Username);

                if (target == null)
                    throw new RestException(HttpStatusCode.NotFound, new { User = "Not Found" });

                var following = await _context.followings.SingleOrDefaultAsync(x => x.ObserverId == observer.Id && x.TargetId == target.Id);
                
                if (following == null)
                    throw new RestException(HttpStatusCode.NotFound, new { User = "You not following this user!"});

                if (following != null)
                {
                    _context.followings.Remove(following);
                }

                var success = await _context.SaveChangesAsync() > 0;

                if (success) return Unit.Value;

                throw new Exception("Problem saving changes");
            }
        }
    }
}