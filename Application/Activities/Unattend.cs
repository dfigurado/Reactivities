using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Exceptions;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class Unattend
    {
        public class Command : IRequest
        {
            // Command logic
            public Guid Id { get; set}
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
                var activity = await _context.Activities.FindAsync(request.Id);

                if (activity == null)
                    throw new RestException(HttpStatusCode.NotFound,
                        new { activity = "Could not find activity" });

                var user = await _context.Users.SingleOrDefaultAsync(x =>
                    x.UserName == _userAccessor.GetCurrentUsername());  //if user is null the code wont hit this line, because an exception is thrown before comming this.

                var attendence = await _context.UserActivities
                    .SingleOrDefaultAsync(x => x.ActivityId == activity.Id &&
                         x.AppUserId == user.Id);

                if (attendence == null)
                    return Unit.Value;

                if (attendence.IsHost)
                    throw new RestException(HttpStatusCode.BadRequest, new { attendence = "You cannot removed your self from host"});
                
                _context.UserActivities.Remove(attendence)
                var success = await _context.SaveChangesAsync() > 0;

                if (success) return Unit.Value;

                throw new Exception("Problem saving changes");
            }
        }
    }
}