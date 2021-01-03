import { observable, computed, action, runInAction } from 'mobx';
import agent from '../api/agent';
import { IUser, IUserFormValues } from '../models/user';
import { RootStore } from './rootStore';
import { history} from '../..';

export default class UserStore {

    rootStore: RootStore;

    constructor(rootStore: RootStore){
        this.rootStore = rootStore;
    }

    @observable user: IUser | null = null;
    @observable loading = false;

    @computed get isLoggedIn() { 
        return !!this.user
    }

    @action login = async (values: IUserFormValues) => {
        try{
            const user = await agent.user.login(values);
            runInAction(() =>  {
                this.user = user;
            });
            this.rootStore.commonStore.setToken(user.token);
            this.rootStore.modalStore.closeModal();
            history.push('/activities');
        }catch(error){
            throw error;
        }
    }

    @action register = async (values:IUserFormValues) => {
        try
        {
            const user = await agent.user.register(values);
            this.rootStore.commonStore.setToken(user.token);
            this.rootStore.modalStore.closeModal();
            history.push('/activities');
        }catch (error){
            throw error;
        }
    }

    @action getUser = async () => {
        try{
            const user = await agent.user.current();
            runInAction(() => {
                this.user = user;
            });
        }catch (error){
            console.log(error)
        }
    }

    @action logout = () => {
        this.rootStore.commonStore.setToken(null);
        this.user = null;
        history.push('/');
    }

    @action fblogin = async (response:any) => {
        this.loading = true
        try{
            const user = await agent.user.fblogin(response.accessToken);
            runInAction(() => {
                this.user =  user;
                this.rootStore.commonStore.setToken(user.token);
                this.rootStore.modalStore.closeModal();
                this.loading = false;
            });
            history.push("/activities");
        }catch(error){
            throw error
        }
    }
}