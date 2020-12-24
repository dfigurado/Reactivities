import { configure } from 'mobx';
import { createContext } from 'react';
import activityStore from './activityStore';
import CommonStore from './commonStore';
import userStore from './userStore';
import ModalStore from './modalStore';

configure({ enforceActions: 'always' });

// Manages the state using mobx, this called 'store'
export class RootStore {
    activityStore: activityStore;
    userStore: userStore;
    commonStore: CommonStore;
    modalStore:  ModalStore;

    constructor(){
        this.activityStore = new activityStore(this);
        this.userStore = new userStore(this);
        this.commonStore = new CommonStore(this);
        this.modalStore = new ModalStore(this);
    }
}

export const RootStoreContext = createContext(new RootStore());