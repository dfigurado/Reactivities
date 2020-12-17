import React, {useContext, useEffect} from 'react';
import { Grid } from 'semantic-ui-react';
import ActivityList from './ActivityList';
import { observer } from 'mobx-react-lite';
import ActivityStore from '../../../app/stores/activityStore';
import Loading from '../../../app/layout/Loading';

const ActivityDashboard: React.FC = () => {

  const activityStore = useContext(ActivityStore);

  useEffect(() => {
    activityStore.loadActivities(); // Store method
  }, [activityStore]); //Tell useEffect about the loadActivities functions dependecy

  if (activityStore.loadingInitial)
    return <Loading content="Loading activities..." />;


  return (
    <Grid>
      <Grid.Column width={10}>
         <ActivityList />
      </Grid.Column>
      <Grid.Column width={6}>
        <h3>Activty Filter</h3>
      </Grid.Column>
    </Grid>
  );
};

export default observer(ActivityDashboard);