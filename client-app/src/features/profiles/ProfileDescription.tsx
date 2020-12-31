import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { RootStoreContext } from '../../app/stores/rootStore';
import { Tab, Grid, Header, Button } from 'semantic-ui-react';

import ProfileEditForm from './ProfileEditForm';

const ProfileDescription: React.FC = () => {
    const rootStore = useContext(RootStoreContext);
    const { profile, updateProfile, isCurrentUser} = rootStore.profileStore;

    const [ editMode, setEditMode] = useState(false);

    return (
        <Tab.Pane>
            <Grid.Column width={16}>
                <Header floated="left" icon="user" content={`About ${profile!.displayName}`} />
                {isCurrentUser && (
                    <Button
                        floated='right'
                        basic
                        content={editMode ? 'Cancel' : 'Edit Profile'}
                        onClick={() => setEditMode(!editMode)}
                    />
                )}
            </Grid.Column>
            <Grid.Column width={16}>
                {editMode ? (
                    <ProfileEditForm updateProfile={updateProfile} profile={profile!} />
                ):(
                    <div>
                        { profile!.bio }
                    </div>
                )}
            </Grid.Column>
        </Tab.Pane>
    );
};

export default observer(ProfileDescription);