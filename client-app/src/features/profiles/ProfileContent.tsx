import React from "react";
import ProfileImages from './ProfileImages';
import ProfileDescription from './ProfileDescription';
import { Tab } from 'semantic-ui-react';

const panes = [
  { menuItem: 'About', render: () => <ProfileDescription />},
  { menuItem: 'Photos', render: () => <ProfileImages />},
  { menuItem: 'Activities', render: () => <Tab.Pane>Activity content</Tab.Pane>},
  { menuItem: 'Follower', render: () => <Tab.Pane>Followers content</Tab.Pane>},
  { menuItem: 'Following', render: () => <Tab.Pane>Following content</Tab.Pane>},
];

const ProfileContent = () => {
  return (
    <Tab
      menu={{ fluid: true, vertical: true }}
      menuPosition='right'
      panes={panes}
    />
  );
};

export default ProfileContent;
