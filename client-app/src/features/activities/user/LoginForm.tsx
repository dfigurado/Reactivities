import React, { useContext } from "react";
import TextInput from "../../../app/common/form/TextInput";
import { Button, Divider, Form, Header } from "semantic-ui-react";
import { Form as FinalForm, Field } from "react-final-form";
import { RootStoreContext } from "../../../app/stores/rootStore";
import { IUserFormValues } from "../../../app/models/user";
import { FORM_ERROR } from "final-form";
import { combineValidators, isRequired } from "revalidate";
import ErrorMessage  from "../../../app/common/form/ErrorMessage";
import SocialLogin from './SocialLogin';
import {observer} from 'mobx-react-lite';

const validate = combineValidators({
  email: isRequired("email"),
  password: isRequired("password"),
});

const LoginForm: React.FC = () => {
  const rootStore = useContext(RootStoreContext);
  const { login, fblogin, loading } = rootStore.userStore;

  return (
    <FinalForm
      onSubmit={(values: IUserFormValues) =>
        login(values).catch((error) => ({
          [FORM_ERROR]: error,
        }))
      }
      validate={validate}
      render={({
        handleSubmit,
        submitting,
        form,
        submitError,
        invalid,
        pristine,
        dirtySinceLastSubmit,
      }) => (
        <Form onSubmit={handleSubmit} error>
          <Header as='h2' content='Login to Reactivities' color='teal' textAlign='center' ></Header>
          <Field name="email" placeholder="E-mail" component={TextInput} />
          <Field
            name="password"
            type="password"
            placeholder="Password"
            component={TextInput}
          />
          {submitError && !dirtySinceLastSubmit && (
            <ErrorMessage  error={submitError} text='Invalid email or password'/>
          )}
          <Button
            disabled={(invalid && !dirtySinceLastSubmit) || pristine}
            loading={submitting}
            color='teal'
            content="Login"
            fluid
          />
          <Divider horizontal>Or</Divider>
          <SocialLogin loading={loading} fbCallback={fblogin} />
        </Form>
      )}
    />
  );
};

export default observer(LoginForm);