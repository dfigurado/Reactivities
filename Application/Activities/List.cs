using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

using Microsoft.EntityFrameworkCore;

using Domain;

using MediatR;

using Persistence;
using Application.Dto;
using AutoMapper;

namespace Application.Activities
{
    public class List
    {
        public class Query : IRequest<List<ActivityDto>> { }

        public class Handler : IRequestHandler<Query, List<ActivityDto>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;
            public Handler(DataContext context, IMapper mapper)
            {
                _mapper = mapper;
                _context = context;
            }

            public async Task<List<ActivityDto>> Handle(Query request, CancellationToken cancellationToken)
            {
                // Egar Loading
                /*
                var activities = await _context.Activities
                    .Include(x => x.UserActivities)
                    .ThenInclude(x => x.AppUser)
                    .ToListAsync();
                */
                // Lazy Loading
                var activities =  await _context.Activities.ToListAsync();
                return _mapper.Map<List<Activity>, List<ActivityDto>>(activities);
            }
        }
    }
}