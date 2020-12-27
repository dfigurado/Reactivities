import React, { useContext, useEffect, Fragment } from "react";
import { Container } from "semantic-ui-react";
import NavBar from "../../features/nav/NavBar";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";
import { observer } from "mobx-react-lite";
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from "react-router-dom";
import homePage from "../../features/home/HomePage";
import ActivityForm from "../../features/activities/form/ActivityForm";
import ActivityDetails from "../../features/activities/activitydetails/ActivityDetails";
import NotFound from "./NotFound";
import ProfilePage from '../../features/profiles/ProfilePage';
import LoginForm from '../../features/activities/user/LoginForm';
import ModalContainer from '../common/modals/modalContainer';
import { ToastContainer } from "react-toastify";
import { RootStoreContext } from "../stores/rootStore";
import Loading from "./Loading";

const App: React.FC<RouteComponentProps> = ({ location }) => {

  const rootStore = useContext(RootStoreContext);
  const { setAppLoaded, token, appLoaded } = rootStore.commonStore;
  const { getUser } = rootStore.userStore;

  useEffect(() => {
    if (token) {
        getUser().finally(() => setAppLoaded());
    } else {
      setAppLoaded();
    }
  }, [getUser, setAppLoaded, token]);
  
  if (!appLoaded) return <Loading content='Loading app.....' />

  return (
    <Fragment>
      <ModalContainer />
      <ToastContainer position='bottom-right' />
      <Route exact path="/" component={homePage} />
      <Route
        path={"/(.+)"}
        render={() => (
          <Fragment>
            <NavBar />
            <Container style={{ marginTop: "10em" }}>
              <Switch>
                <Route exact path="/activities" component={ActivityDashboard} />
                <Route path="/activities/:id" component={ActivityDetails} />
                <Route
                  key={location.key}
                  path={["/create", "/manage/:id"]}
                  component={ActivityForm}
                />
                <Route path='/login' component={LoginForm} />
                <Route path='/profile/:username' component={ProfilePage} />
                <Route component={NotFound} />
              </Switch>
            </Container>
          </Fragment>
        )}
      />
    </Fragment>
  );
};

export default withRouter(observer(App));
