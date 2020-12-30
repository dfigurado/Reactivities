import React from "react";
import ProfileImages from './ProfileImages';
import ProfileFollowings from "./ProfileFollowing";
import ProfileDescription from './ProfileDescription';
import { Tab } from 'semantic-ui-react';

const panes = [
  { menuItem: 'About', render: () => <ProfileDescription />},
  { menuItem: 'Photos', render: () => <ProfileImages />},
  { menuItem: 'Activities', render: () => <Tab.Pane>Activity content</Tab.Pane>},
  { menuItem: 'Follower', render: () => <ProfileFollowings />},
  { menuItem: 'Following', render: () => <ProfileFollowings />},
];

interface IProps {
  setActiveTab: (activeIndex:any) => void;
}

const ProfileContent: React.FC<IProps> = ({ setActiveTab }) => {
  return (
    <Tab
      menu={{ fluid: true, vertical: true }}
      menuPosition='right'
      panes={panes}
      onTabChange={(e, data) => setActiveTab(data.activeIndex) }
    />
  );
};

export default ProfileContent;
