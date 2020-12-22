import React, {useContext, useEffect} from 'react';
import { Grid } from 'semantic-ui-react';
import ActivityList from './ActivityList';
import { observer } from 'mobx-react-lite';
import Loading from '../../../app/layout/Loading';
import { RootStoreContext } from '../../../app/stores/rootStore';

const ActivityDashboard: React.FC = () => {

  const rootStore = useContext(RootStoreContext);
  const {loadActivities, loadingInitial} = rootStore.activityStore;

  useEffect(() => {
    loadActivities(); // Store method
  }, [loadActivities]); //Tell useEffect about the loadActivities functions dependecy

  if (loadingInitial)
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