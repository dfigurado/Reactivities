import { configure } from 'mobx';
import { createContext } from 'react';
import activityStore from './activityStore';
import userStore from './userStore';

// Manages the state using mobx, this called 'store'
configure({ enforceActions: 'always' });

export class RootStore {
    activityStore: activityStore;
    userStore: userStore;

    constructor(){
        this.activityStore = new activityStore(this);
        this.userStore = new userStore(this);
    }
}

export const RootStoreContext = createContext(new RootStore());