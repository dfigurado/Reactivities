import {action, observable, runInAction, computed, reaction} from 'mobx';
import agent from '../api/agent';
import {IProfile, IPhoto} from '../models/profile';
import {RootStore} from './rootStore';
import {toast} from "react-toastify";

export default class ProfileStore {
    rootStore: RootStore
    @observable profile: IProfile | null = null;
    @observable loading = false;
    @observable loadingProfile = true;
    @observable uploadingImage = false;
    @observable followings: IProfile[] = [];
    @observable activeTab: number = 0;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore
        reaction(
            () => this.activeTab,
            activeTab => {
                if (activeTab === 3 || activeTab === 4){
                    const predicate = activeTab === 3 ? 'followers' : 'following';
                    this.loadFollowings(predicate);
                } else {
                    this.followings = [];
                }
            }
        )
    }

    @computed get isCurrentUser() {
        if (this.rootStore.userStore.user && this.profile) {
            return this.rootStore.userStore.user.username === this.profile.username;
        } else {
            return false;
        }
    }

    @action loadProfile = async (username: string) => {
        this.loadingProfile = true;
        try {
            const profile = await agent.profiles.get(username);
            runInAction(() => {
                this.profile = profile;
                this.loadingProfile = false;
            })
        } catch (error) {
            runInAction(() => {
                this.loadingProfile = false;
            });
            console.log(error);
        }
    }

    @action uploadImage = async (file: Blob) => {
        this.uploadingImage = true;
        try {
            const photo = await agent.profiles.uploadPhoto(file);
            runInAction(() => {
                if (this.profile) {
                    this.profile.photos.push(photo);
                    if (photo.isMain && this.rootStore.userStore.user) {
                        this.rootStore.userStore.user.image = photo.url;
                        this.profile.image = photo.url
                    }
                }
                this.uploadingImage = false;
            })
        } catch (error) {
            toast.error('Problem uploading image');
            runInAction(() => {
                this.uploadingImage = false;
            })
        }
    }

    @action setMainPhoto = async (photo: IPhoto) => {
        this.loading = true;
        try {
            await agent.profiles.setMainPhoto(photo.id);
            runInAction(() => {
                this.rootStore.userStore.user!.image = photo.url;
                this.profile!.photos.find(p => p.isMain)!.isMain = false;
                this.profile!.photos.find(p => p.id === photo.id)!.isMain = true;
                this.profile!.image = photo.url;
                this.loading = false;
            })
        } catch (error) {
            toast.error('Problem setting image as main');
            runInAction(() => {
                this.loading = false;
            });
        }
    }

    @action deletePhoto = async (photo: IPhoto) => {
        this.loading = true;
        try {
            await agent.profiles.deletePhoto(photo.id);
            runInAction(() => {
                this.profile!.photos = this.profile!.photos.filter(a => a.id !== photo.id);
                this.loading = false
            });
        } catch (error) {
            toast.error('Problem deleting photo');
            runInAction(() => {
                this.loading = false;
            })
        }
    }

    @action updateProfile = async (profile: Partial<IProfile>) => {
        try {
            await agent.profiles.updateProfile(profile);
            runInAction(() => {
                if (profile.displayName !== this.rootStore.userStore.user!.displayName) {
                    this.rootStore.userStore.user!.displayName = profile.displayName!;
                }
                this.profile = {...this.profile!, ...profile};
            });
        } catch (error) {
            toast.error('Problem updating profile');
        }
    }

    @action follow = async (username: string) => {
        this.loading = true;
        try {
            await agent.profiles.follow(username);
            runInAction(() => {
                this.profile!.isFollowing = true;
                this.profile!.followersCount++;
                this.loading = false;
            })
        } catch (error) {
            toast.error('Problem following user');
            runInAction(() => {
                this.loading = false;
            })
        }
    }

    @action unfollow = async (username: string) => {
        this.loading = true;
        try {
            await agent.profiles.follow(username);
            runInAction(() => {
                this.profile!.isFollowing = false;
                this.profile!.followersCount--;
                this.loading = false;
            })
        } catch (error) {
            toast.error('Problem unfollowing user');
            runInAction(() => {
                this.loading = false;
            })
        }
    }

    @action loadFollowings = async (predicate: string) => {
        this.loading = true
        try {
            const profiles = await agent.profiles.listFollowings(this.profile!.username, predicate);
            runInAction(() => {
                this.followings = profiles;
                this.loading = false;
            })
        } catch (Errors) {
            toast.error('Problem loading followings');
            runInAction(() => {
                this.loading = false
            })
        }
    }

    @action setActiveTab = (activeIndex: number) => {
        this.activeTab = activeIndex;

    }
}