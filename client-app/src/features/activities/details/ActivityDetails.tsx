import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect } from 'react';
import { Card, Image, Button } from 'semantic-ui-react';
import { Link, RouteComponentProps } from 'react-router-dom';
import Loading from  '../../../app/layout/Loading';
import ActivityStore from '../../../app/stores/activityStore';

interface DetailsParams {
  id:string
}

const ActivityDetails: React.FC<RouteComponentProps<DetailsParams>> = ({ match, history }) => {
  const activityStore = useContext(ActivityStore);
  const { activity, loadActivity, loadingInitial } = activityStore;

  useEffect(() => {
    loadActivity(match.params.id);
  },[loadActivity, match.params.id])

  if (loadingInitial || !activity) return <Loading content='Loading activity...' />

  return (
    <Card fluid>
      <Image
        src={`/assets/categoryImages/${activity!.category}.jpg`}
        wrapped
        ui={false}
      />
      <Card.Content>
        <Card.Header>{activity!.title}</Card.Header>
        <Card.Meta>
          <span>{activity!.date}</span>
        </Card.Meta>
        <Card.Description>{activity!.description}</Card.Description>
      </Card.Content>
      <Card.Content extra>
        <Button.Group widths={2}>
          <Button
            as={Link} 
            to={`/mange/${activity.id}`}
            basic
            color="blue"
            content="Edit"
          />
          <Button
            basic
            color="grey"
            content="Cancel"
            onClick={() => history.push('/activities')}
          />
        </Button.Group>
      </Card.Content>
    </Card>
  );
};

export default observer(ActivityDetails);
