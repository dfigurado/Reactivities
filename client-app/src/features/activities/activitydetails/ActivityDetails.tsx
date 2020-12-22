import { observer } from "mobx-react-lite";
import React, { useContext, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Grid, GridColumn } from "semantic-ui-react";
import Loading from "../../../app/layout/Loading";
import ActivityDetailInfo from './ActivityDetailInfo';
import ActivityDetailHeader from './ActivityDetailHeader';
import ActivityDetailChat from './ActivityDetailChat';
import ActivityDetailSideBar from './ActivityDetailedSidebar';
import { RootStoreContext } from "../../../app/stores/rootStore";

interface Params {
  id: string;
}

const ActivityDetails: React.FC<RouteComponentProps<Params>> = ({ match }) => {
  const rootStore = useContext(RootStoreContext);
  const {
    activity,
    loadActivity,
    loadingInitial,
  } = rootStore.activityStore;

  useEffect(() => {
    loadActivity(match.params.id);
  }, [loadActivity, match.params.id]);

  if (loadingInitial || !activity) {
    return <Loading content="Loading content.." />;
  }

  return (
    <Grid>
      <GridColumn width={10}>
        <ActivityDetailHeader activity={activity} />
        <ActivityDetailInfo activity={activity} />
        <ActivityDetailChat />
      </GridColumn>
      <GridColumn width={6}>
        <ActivityDetailSideBar/>
      </GridColumn>
    </Grid>
  );
};

export default observer(ActivityDetails);