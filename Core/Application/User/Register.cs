using System;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Application.Exceptions;
using Application.Interfaces;
using Application.Validators;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.User
{
    public class Register
    {
        public class Command : IRequest  //Command should not returny any in general
        {
            // Command logic
            public string DisplayName { get; set; }
            public string Username { get; set; }
            public string Email { get; set; }
            public string Password { get; set; }
            public string Origin { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.DisplayName).NotEmpty();
                RuleFor(x => x.Username).NotEmpty();
                RuleFor(x => x.Email).NotEmpty().EmailAddress();
                RuleFor(x => x.Password).Password();
            }
        }

        public class Handler : IRequestHandler<Command>
        {
            private readonly DataContext _context;
            private readonly UserManager<AppUser> _userManager;
            private readonly IEmailSender _emailSender;
            public Handler(DataContext context, UserManager<AppUser> userManager, IEmailSender emailSender)
            {
                _emailSender = emailSender;
                _userManager = userManager;
                _context = context;
            }

            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {
                if (await _context.Users.Where(x => x.Email == request.Email).AnyAsync())
                    throw new RestException(HttpStatusCode.BadRequest, new { Email = "Email already exsists" });

                if (await _context.Users.Where(x => x.UserName == request.Username).AnyAsync())
                    throw new RestException(HttpStatusCode.BadRequest, new { Username = "Username already exsists" });

                // New user object
                var user = new AppUser
                {
                    DisplayName = request.DisplayName,
                    Email = request.Email,
                    UserName = request.Username
                };

                // Create new user
                var result = await _userManager.CreateAsync(user, request.Password);

                if (!result.Succeeded)
                    throw new Exception("Problem creating user");

                // Email verification token
                var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                 // The generated email confirmation token can't be used as a query string.
                 // because it has characters which will be encoded by the browser. 
                 // Web encoder is used to encode the 'email verification' token so that it 
                 // can be used in a query string.
                token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

                // Create url for email address verification email
                var verifyUrl = $"{request.Origin}/user/verifyEmail?token={token}&email={request.Email}";
                //Email message
                var message = $"<p>Please click the below link to verify your email address:</p><p><a href='{verifyUrl}'>{verifyUrl}</a></p>";
                // Send account verification email
                await _emailSender.SendEmailAsync(request.Email, "Please verify email", message);

                return Unit.Value;
            }
        }
    }
}