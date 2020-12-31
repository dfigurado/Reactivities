import React, {useContext} from "react";
import ProfileCard from './ProfileCard';
import {RootStoreContext} from "../../app/stores/rootStore";
import {Tab, Grid, Header, Card} from "semantic-ui-react";

const ProfileFollowings: React.FC = () => {
    const rootStore = useContext(RootStoreContext);
    const {profile, followings, activeTab, loading} = rootStore.profileStore;

    return (
        <Tab.Pane loading={loading}>
            <Grid>
                <Grid.Column width={16}>
                    <Header
                        floated='left'
                        icon='user'
                        content={
                            activeTab === 3
                                ? `People following ${profile!.displayName}`
                                : `People ${profile!.displayName} is following`
                        }
                    />
                </Grid.Column>
                <Grid.Column width={16}>
                    <Card.Group itemsPerRow={5}>
                        {followings.map((profile) => (
                            <ProfileCard key={profile.username} profile={profile}/>
                        ))}
                    </Card.Group>
                </Grid.Column>
            </Grid>
        </Tab.Pane>
    )
}

export default ProfileFollowings;