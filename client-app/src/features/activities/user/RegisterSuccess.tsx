import React from 'react';
import agent from '../../../app/api/agent';
import queryString from 'query-string';
import { toast } from 'react-toastify';
import { RouteComponentProps } from 'react-router-dom';
import { Header, Segment, Icon, Button } from 'semantic-ui-react';

const RegisterSuccess: React.FC<RouteComponentProps> = ({ location }) => {
  const { email } = queryString.parse(location.search);

  const handleConfirmationEmailResend = () => {
    agent.user
      .resendVerifyEmailConfirmation(email as string)
      .then(() => {
        toast.success("Verification email resent - check your email");
      })
      .catch((error) => console.log(error));
  };

  return (
    <Segment placeholder>
      <Header icon>
        <Icon name="check" />
        Successfully registered!
      </Header>
      <Segment.Inline>
        <div className="center">
          <p>
            Please check your email (including spam folder) for the verification
            email
          </p>
          {email && (
            <>
              <p>
                Didn't receive the email? Please click the below button to
                resend
              </p>
              <Button
                primary
                content="Resend email"
                size="huge"
                onClick={handleConfirmationEmailResend}
              />
            </>
          )}
        </div>
      </Segment.Inline>
    </Segment>
  );
};

export default RegisterSuccess;