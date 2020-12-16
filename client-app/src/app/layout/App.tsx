import React, { useEffect, useContext, Fragment } from 'react';
import { Container } from 'semantic-ui-react';
import NavBar from '../../features/nav/NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import Loading from '../layout/Loading';
import ActivityStore from '../stores/activityStore';
import { observer } from 'mobx-react-lite';

const App = () => {
  const activityStore = useContext(ActivityStore)

  useEffect(() => {
    activityStore.loadActivities(); // Store method
  }, [activityStore]); //Tell useEffect about the loadActivities functions dependecy

  if (activityStore.loadingInitial)
    return <Loading content='Loading activities...' />

  return (
    <Fragment>
      <NavBar />
      <Container style={{ marginTop: "10em" }}>
        <ActivityDashboard />
      </Container>
    </Fragment>
  );
};

export default observer(App);