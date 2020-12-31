using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

using Microsoft.EntityFrameworkCore;

using Domain;

using MediatR;

using Persistence;
using Application.Dto;
using AutoMapper;
using Application.Interfaces;

namespace Application.Activities
{
    public class List
    {
        public class ActivitiesEnvelop
        {
            public List<ActivityDto> Activities { get; set; }
            public int ActivityCount { get; set; }
        }

        public class Query : IRequest<ActivitiesEnvelop>
        {
            public int? Limit { get; set; }
            public int? OffSet { get; set; }
            public bool IsGoing { get; set; }
            public bool IsHost { get; set; }
            public DateTime? StartDate { get; set; }

            public Query(int? limit, int? offSet, bool isGoing, bool isHost, DateTime? startDate)
            {
                Limit = limit;
                OffSet = offSet;
                IsGoing = isGoing;
                IsHost = isHost;
                StartDate = startDate ?? DateTime.Now; //this ensures only activities happening in future is displayed by default.
            }
        }

        public class Handler : IRequestHandler<Query, ActivitiesEnvelop>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;
            private readonly IUserAccessor _userAccessor;
            public Handler(DataContext context, IMapper mapper, IUserAccessor userAccessor)
            {
                _userAccessor = userAccessor;
                _mapper = mapper;
                _context = context;
            }

            public async Task<ActivitiesEnvelop> Handle(Query request, CancellationToken cancellationToken)
            {
                // Egar Loading
                /*
                var activities = await _context.Activities
                    .Include(x => x.UserActivities)
                    .ThenInclude(x => x.AppUser)
                    .ToListAsync();
                */

                // Lazy Loading
                var querable = _context.Activities
                    .Where(x => x.Date >= request.StartDate)
                    .OrderBy(x => x.Date)
                    .AsQueryable();

                //Filter
                if (request.IsGoing && !request.IsHost)
                {
                    querable = querable.Where(x => x.UserActivities.Any(a => a.AppUser.UserName == _userAccessor.GetCurrentUsername()));
                }

                if (request.IsHost && !request.IsGoing)
                {
                    querable = querable.Where(x => x.UserActivities.Any(a => a.AppUser.UserName == _userAccessor.GetCurrentUsername() && a.IsHost));
                }

                var activities = await querable
                    .Skip(request.OffSet ?? 0)
                    .Take(request.Limit ?? 3)
                    .ToListAsync();

                return new ActivitiesEnvelop
                {
                    Activities = _mapper.Map<List<Activity>, List<ActivityDto>>(activities),
                    ActivityCount = querable.Count()
                };
            }
        }
    }
}