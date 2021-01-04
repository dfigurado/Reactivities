using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;

namespace Application.User
{
    public class ResendEmailVerification
    {
        public class Query : IRequest
        {
            public string Email { get; set; }
            public string Origin { get; set; }
        }

        public class Handler : IRequestHandler<Query>
        {
            private readonly UserManager<AppUser> _userManager;
            private readonly IEmailSender _emailSender;
            public Handler(UserManager<AppUser> userManager, IEmailSender emailSender)
            {
                _emailSender = emailSender;
                _userManager = userManager;
            }

            public async Task<Unit> Handle(Query request, CancellationToken cancellationToken)
            {
                var user = await _userManager.FindByEmailAsync(request.Email);

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