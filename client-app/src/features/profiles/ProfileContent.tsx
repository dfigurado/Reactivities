import React from "react";
import ProfileImages from './ProfileImages';
import { Tab } from "semantic-ui-react";

const panes = [
  { 
    menuItem: "About",
    render: () => <Tab.Pane>About content</Tab.Pane> 
  },
  { 
    menuItem: "Photos",
    render: () => <ProfileImages />
  },
  {
    menuItem: "Activities",
    render: () => <Tab.Pane>Activity content</Tab.Pane>,
  },
  {
    menuItem: "Followers",
    render: () => <Tab.Pane>Followers content</Tab.Pane>,
  },
  {
    menuItem: "Following",
    render: () => <Tab.Pane>Following content</Tab.Pane>,
  },
];

const ProfileContent = () => {
  return (
    <Tab
      menu={{ fluid: true, vertical: true }}
      menuPosition="right"
      panes={panes}
      activeIndex={1}
    />
  );
};

export default ProfileContent;
