using System;
using System.Net;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;

using AutoMapper;
using Application.Exceptions;

using Domain;

using MediatR;

using Persistence;
using Application.Dto;

namespace Application.Activities
{
    public class Details
    {
        public class Query : IRequest<ActivityDto>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Query, ActivityDto>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;
            public Handler(DataContext context, IMapper mapper)
            {
                _mapper = mapper;
                _context = context;
            }

            public async Task<ActivityDto> Handle(Query request, CancellationToken cancellationToken)
            {
                // Eager Loading
                /*
                var activity = await _context.Activities
                    .Include(x => x.UserActivities)
                    .ThenInclude(x => x.AppUser)
                    .SingleOrDefaultAsync(x => x.Id == request.Id);
                */
                // Lazy loading
                var activity = await _context.Activities.FindAsync(request.Id);

                if (activity == null)
                    throw new RestException(HttpStatusCode.NotFound, new { activity = "Not found" }); //REST Exceptions

                var activityToReturn = _mapper.Map<Activity, ActivityDto>(activity);

                return activityToReturn;
            }
        }
    }

}