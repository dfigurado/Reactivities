import React, { useState, useEffect, Fragment, SyntheticEvent } from "react";
import { IActivity } from "../models/activity";
import { Container } from "semantic-ui-react";
import NavBar from "../../features/nav/NavBar";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";
import Loading from '../layout/Loading';
import agent from '../api/agent';

const App = () => {
  //Hooks
  const [activities, setActivites] = useState<IActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(
    null
  );
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [target, setTarget] = useState('');

  const hanleSelectActivity = (id: string) => {
    setSelectedActivity(activities.filter((a) => a.id === id)[0]);
    setEditMode(false);
  };

  const handleOpenCreateForm = () => {
    setSelectedActivity(null);
    setEditMode(true);
  }

  const handleCreateActivity = (activity:IActivity) => {
    setSubmitting(true);
    agent.activities.create(activity).then(() => {
      setActivites([...activities, activity]);
      setSelectedActivity(activity);
      setEditMode(false);
    }).then(() => setSubmitting(false));
  }

  const handleEditActivity = (activity: IActivity) => {
    setSubmitting(true);
    agent.activities.update(activity).then(() => {
      setActivites([...activities.filter(a => a.id !== activity.id), activity]);
      setSelectedActivity(activity);
      setEditMode(false);
    }).then(() => setSubmitting(false));
  }

  const handleDeleteActivity = (event: SyntheticEvent<HTMLButtonElement>, id:string) => {
    setSubmitting(true);
    setTarget(event.currentTarget.id);
    agent.activities.delete(id).then(() =>  {
      setActivites([...activities.filter(a => a.id !== id)]);
    }).then(() => setSubmitting(false));
  }

  useEffect(() => {
    agent.activities.list().then(response => { 
      let activities:IActivity[] = [];
      response.forEach((activity) => {
         activity.date = activity.date.split('.')[0];
         activities.push(activity);
      })
      setActivites(activities);
    }).then(() => setLoading(false));
  }, []);

  if (loading)
    return <Loading content='Loading activities...' />

  return (
    <Fragment>
      <NavBar openCreateForm={handleOpenCreateForm} />
      <Container style={{ marginTop: "10em" }}>
        <ActivityDashboard
          activities={activities}
          selectActivity={hanleSelectActivity}
          selectedActivity={selectedActivity}
          editMode={editMode}
          setEditMode={setEditMode}
          setSelectedActivity={setSelectedActivity}
          createActivity={handleCreateActivity}
          editActivity={handleEditActivity}
          deleteActivity={handleDeleteActivity}
          submitting={submitting}
          target={target}
        />
      </Container>
    </Fragment>
  );
};

export default App;