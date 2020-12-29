import agent from '../api/agent';
import {history} from '../..';
import {SyntheticEvent} from 'react';
import {IActivity} from '../models/activity';
import {action, computed, observable, runInAction} from 'mobx';
import {toast} from 'react-toastify';
import {RootStore} from './rootStore';
import {createAttendee, setActivityProps} from '../common/util/Util';
import {HubConnection, HubConnectionBuilder, LogLevel} from "@microsoft/signalr";

export default class ActivityStore {

    rootStore: RootStore;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @observable activityRegistry = new Map();
    @observable activity: IActivity | null = null;
    @observable loadingInitial = false;
    @observable submitting = false;
    @observable target = '';
    @observable loading = false;
    @observable.ref hubConnection: HubConnection | null = null;

    @action createHubConnection = (activityId:string) =>{
        this.hubConnection = new HubConnectionBuilder()
            .withUrl('http://localhost:5000/chat', {
                accessTokenFactory: () => this.rootStore.commonStore.token!
            })
            .configureLogging(LogLevel.Information)
            .build();

        if (this.hubConnection!.state === 'Disconnected'){
            this.hubConnection
                .start()
                .then(() => console.log(this.hubConnection!.state))
                .then(() => {
                    this.hubConnection!.invoke('AddToGroup', activityId)
                })
                .catch(error => console.log('Error establishing hub connection:', error));
        }

        this.hubConnection.on('ReceiveComment', comment => {
            runInAction(() => {
                this.activity!.comments.push(comment);
            });
        });
    };

    @action stopHubConnection = () => {
        this.hubConnection!.invoke('RemoveFromGroup', this.activity!.id)
            .then(() => {
                this.hubConnection!.stop();
            })
            .then(() => console.log('Connection stopped'))
            .catch(err => console.log(err))

    }

    @action addComment = async (values: any) => {
        values.activityId = this.activity!.id;
        try  {
            await this.hubConnection!.invoke('SendComment', values);
        }catch (error){
            console.log(error);
        }
    }

    @computed get activitiesByDate() {
        return this.groupActivitiesByDate(Array.from(this.activityRegistry.values()));
    }

    // Group Activities by Date using Array reduce method
    groupActivitiesByDate(activities: IActivity[]) {
        const sortedActivities = activities.sort(
            (a, b) => a.date.getTime() - b.date.getTime()
        )
        return Object.entries(sortedActivities.reduce((activities, activity) => {
            const date = activity.date.toISOString().split('T')[0];
            activities[date] = activities[date] ? [...activities[date], activity] : [activity];
            return activities;
        }, {} as { [key: string]: IActivity[] }));
    }

    @action loadActivities = async () => {
        this.loadingInitial = true; // <= mobx allows us to mutate the state. Unlike Redux.
        const user = this.rootStore.userStore.user!;
        try {
            const activities = await agent.activities.list();
            runInAction('loading activities', () => {
                activities.forEach((activity) => {
                    setActivityProps(activity, user!);
                    this.activityRegistry.set(activity.id, activity);
                    this.loadingInitial = false
                });
            });
        } catch (error) {
            runInAction('load activities error', () => {
                this.loadingInitial = false;
            });
        }
    }

    @action loadActivity = async (id: string) => {
        let activity = this.getActivity(id);
        if (activity) {
            this.activity = activity;
            return activity;
        } else {
            this.loadingInitial = true;
            try {
                activity = await agent.activities.details(id);
                runInAction('getting activity', () => {
                    setActivityProps(activity, this.rootStore.userStore.user!);
                    this.activity = activity;
                    this.activityRegistry.set(activity.id, activity);
                    this.loadingInitial = false;
                })
                return activity;
            } catch (error) {
                runInAction('get activity error', () => {
                    this.loadingInitial = false;
                });
                console.log(error);
            }
        }
    }

    @action clearActivity = () => {
        this.activity = null;
    }

    getActivity = (id: string) => {
        return this.activityRegistry.get(id);
    }

    @action createActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.activities.create(activity);

            const attendee = createAttendee(this.rootStore.userStore.user!);
            attendee.isHost = true;
            let attendees = [];
            attendees.push(attendee);
            activity.attendees = attendees;
            activity.comments = [];
            activity.isHost = true;
            runInAction('Create activity', () => {
                this.activityRegistry.set(activity.id, activity);
                this.submitting = false;
            });
            history.push(`/activities/${activity.id}`)
        } catch (error) {
            runInAction('Create activity', () => {
                this.submitting = false;
            });
            toast.error('One or more validation errors occurred.');
            console.log(error)
        }
    }

    @action editActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.activities.update(activity);
            runInAction('Edit activity', () => {
                this.activityRegistry.set(activity.id, activity);
                this.activity = activity;
                this.submitting = false;
            });
            history.push(`/activities/${activity.id}`);
        } catch (error) {
            runInAction('Edit activity', () => {
                this.submitting = false;
            });
            console.log(error);
        }
    }

    @action deleteActivity = async (event: SyntheticEvent<HTMLButtonElement>, id: string) => {
        this.submitting = true;
        this.target = event.currentTarget.name;
        try {
            await agent.activities.delete(id);
            runInAction('Delete activity', () => {
                this.activityRegistry.delete(id);
                this.submitting = false;
                this.target = '';
            });
        } catch (error) {
            runInAction('Delete activity error', () => {
                this.submitting = false;
                this.target = '';
            });
            console.log(error);
        }
    }

    @action attendActivity = async () => {
        const attendee = createAttendee(this.rootStore.userStore.user!);
        this.loading = true;
        try {
            await agent.activities.attend(this.activity!.id);
            runInAction(() => {
                if (this.activity) {
                    this.activity.attendees.push(attendee);
                    this.activity.isGoing = true;
                    this.activityRegistry.set(this.activity.id, this.activity);
                    this.loading = false;
                }
            })
        } catch (error) {
            runInAction(() => {
                this.loading = false;
            });
            toast.error('Problem signing to event');
        }
    }

    @action cancelAttendence = async () => {
        this.loading = true;
        try {
            await agent.activities.unattend(this.activity.id);
            runInAction(() => {
                if (this.activity) {
                    this.activity.attendees = this.activity.attendees.filter(a => a.username !== this.rootStore.userStore.user!.username);
                    this.activity.isGoing = false;
                    this.activityRegistry.set(this.activity.id, this.activity);
                    this.loading = false;
                }
            });
        } catch (error) {
            runInAction(() => {
                this.loading = false;
            });
            toast.error('Problem cancelling to attendence');
        }
    }

    @action cancelSelectedActivity = () => {
        this.activity = null;
    }
}