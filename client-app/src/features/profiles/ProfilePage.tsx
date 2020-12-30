import React, {useContext, useEffect} from "react";
import {Grid} from "semantic-ui-react";
import {observer} from "mobx-react-lite";
import {RootStoreContext} from "../../app/stores/rootStore";
import {RouteComponentProps} from "react-router-dom";

import Loading from "../../app/layout/Loading";
import ProfileHeader from "./ProfileHeader";
import ProfileContent from "./ProfileContent";


interface RouteParams {
    username: string;
}

interface IProps extends RouteComponentProps<RouteParams> {
}

const ProfilePage: React.FC<IProps> = ({match}) => {
    const rootStore = useContext(RootStoreContext);
    const {profile, loadingProfile, loadProfile, follow, unfollow, isCurrentUser, loading, setActiveTab} = rootStore.profileStore;

    useEffect(() => {
        loadProfile(match.params.username);
    }, [loadProfile, match]);

    if (loadingProfile) return <Loading content="Loading profile..."/>;

    return (
        <Grid>
            <Grid.Column width={16}>
                <ProfileHeader
                    profile={profile!}
                    isCurrentUser={isCurrentUser}
                    loading={loading}
                    follow={follow}
                    unfollow={unfollow}
                />
                <ProfileContent setActiveTab={setActiveTab}/>
            </Grid.Column>
        </Grid>
    );
};

export default observer(ProfilePage);
