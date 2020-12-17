import React, { FormEvent, useState, useContext, useEffect } from "react";
import { Segment, Form, Button, Grid, GridColumn } from "semantic-ui-react";
import { IActivity } from "../../../app/models/activity";
import { v4 as uuid } from "uuid";
import ActivityStore from "../../../app/stores/activityStore";
import { observer } from "mobx-react-lite";
import { RouteComponentProps } from "react-router-dom";

interface Params {
  id: string;
}

const ActivityForm: React.FC<RouteComponentProps<Params>> = ({
  match,
  history,
}) => {
  const activityStore = useContext(ActivityStore);
  const {
    createActivity,
    editActivity,
    submitting,
    activity: initialFormState,
    loadActivity,
    clearActivity,
  } = activityStore;

  const [activity, setActivity] = useState<IActivity>({
    id: "",
    title: "",
    category: "",
    description: "",
    date: "",
    city: "",
    venue: "",
  });

  useEffect(() => {
    if (match.params.id && activity.id.length === 0) {
      loadActivity(match.params.id).then(
        () => initialFormState && setActivity(initialFormState)
      );
    }

    return () => {
      clearActivity();
    };
  }, [
    loadActivity,
    clearActivity,
    match.params.id,
    activity.id.length,
    initialFormState,
  ]);

  const handleInputChange = (
    e: FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.currentTarget;

    setActivity({
      ...activity,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    if (activity.id.length === 0) {
      let newActivity = {
        ...activity,
        id: uuid(),
      };
      createActivity(newActivity).then(() =>
        history.push(`/activities/${newActivity.id}`)
      );
    } else {
      editActivity(activity).then(() =>
        history.push(`/activities/${activity.id}`)
      );
    }
  };

  return (
    <Grid>
      <GridColumn width={10}>
        <Segment clearing>
          <Form onSubmit={handleSubmit}>
            <Form.Input
              name="title"
              placeholder="Title"
              value={activity.title}
              onChange={handleInputChange}
            />
            <Form.TextArea
              rows={2}
              name="description"
              placeholder="Description"
              value={activity.description}
              onChange={handleInputChange}
            />
            <Form.Input
              name="category"
              placeholder="Category"
              value={activity.category}
              onChange={handleInputChange}
            />
            <Form.Input
              name="date"
              type="datetime-local"
              placeholder="Date"
              value={activity.date}
              onChange={handleInputChange}
            />
            <Form.Input
              name="city"
              placeholder="City"
              value={activity.city}
              onChange={handleInputChange}
            />
            <Form.Input
              name="venue"
              placeholder="Venue"
              value={activity.venue}
              onChange={handleInputChange}
            />
            <Button
              loading={submitting}
              floated="right"
              positive
              type="submit"
              content="Submit"
            />
            <Button
              onClick={() => history.push(`/activities`)}
              floated="right"
              type="button"
              content="Cancel"
            />
          </Form>
        </Segment>
      </GridColumn>
    </Grid>
  );
};

export default observer(ActivityForm);