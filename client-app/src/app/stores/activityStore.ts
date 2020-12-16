import agent from '../api/agent';
import { SyntheticEvent } from 'react';
import { createContext } from 'react';
import { IActivity } from '../models/activity';
import { observable, action, computed, configure, runInAction }  from 'mobx';

// Manages the state using mobx, this called 'store'
configure({enforceActions:'always'});

class ActivityStore {
    @observable activityRegistry = new Map();
    @observable activities:IActivity[] = [];
    @observable selectedActivity:IActivity | undefined;
    @observable editMode = false;
    @observable loadingInitial = false;
    @observable submitting = false;
    @observable target = '';

    @computed get activitiesByDate() {
        return Array.from(this.activityRegistry.values()).sort(
            (a,b) => Date.parse(a.date) - Date.parse(b.date)
        );
    }

    @action loadActivities = async () => {
        this.loadingInitial = true; // <= mobx allows us to mutate the state. Unlike Redux.
        try
        {
            const activities = await agent.activities.list();
            runInAction('Loading Activities',() => {
                activities.forEach((activity) => {
                    activity.date = activity.date.split('.')[0];
                    this.activityRegistry.set(activity.id, activity);
                    this.loadingInitial = false
                });
            });
        }catch(error){
            runInAction('Load activities errors',() => {
                this.loadingInitial = false;
            });
            console.log(error);
        }
    }

    @action createActivity = async (activity:IActivity) =>  {
        this.submitting = true;
        try
        {
            await agent.activities.create(activity);
            runInAction('Create activity',() => {
                this.activityRegistry.set(activity.id, activity);
                this.editMode = false;
                this.submitting = false;
            });
        } catch(error){
            runInAction('Create activity',()=>{
                this.submitting = false;
            });
            console.log(error);
        }
    }

    @action editActivity = async (activity:IActivity) => {
        this.submitting = true;
        try{
             await agent.activities.update(activity);
             runInAction('Edit activity',() => {
                this.activityRegistry.set(activity.id, activity);
                this.selectedActivity = activity;
                this.editMode = false;
                this.submitting = false;    
             })
        }catch(error){
            runInAction('Edit activity',() => {
                this.submitting = false;  
            });
            console.log(error);
        }
    }

    @action deleteActivity = async (event: SyntheticEvent<HTMLButtonElement> ,id:string) => {
        this.submitting = true;
        this.target = event.currentTarget.name;
        try {
            await agent.activities.delete(id);
            runInAction('Delete activity',() => {
                this.activityRegistry.delete(id);
                this.submitting = false;
                this.target = '';
            });
        }catch (error){
            runInAction('Delete activity error',() => {
                this.submitting = false;
                this.target = '';
            });  
            console.log(error);
        }
    }

    @action selectActivity =  (id:string) => {
        this.selectedActivity = this.activityRegistry.get(id);
        this.editMode = false;
    }

    @action openCreateForm = () => {
        this.editMode = true;
        this.selectedActivity = undefined;
    }

    @action openEditForm = (id:string) => {
        this.selectedActivity = this.activityRegistry.get(id);
        this.editMode = true;
    }

    @action cancelSelectedActivity = () => {
        this.selectedActivity = undefined;
    }

    @action cancelFormOpen = () => {
        this.editMode = false;
    }
}

export default createContext(new ActivityStore());