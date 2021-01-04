import { observable, computed, action, runInAction } from 'mobx';
import agent from '../api/agent';
import { IUser, IUserFormValues } from '../models/user';
import { RootStore } from './rootStore';
import { history} from '../..';

export default class UserStore {

    refreshTokenTimeOut:any;
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
            this.startRefreshTokenTimer(user);
            this.rootStore.modalStore.closeModal();
            history.push('/activities');
        }catch(error){
            throw error;
        }
    }

    @action register = async (values:IUserFormValues) => {
        try
        {
            await agent.user.register(values);
            this.rootStore.modalStore.closeModal();
            history.push(`/user/registerSuccess?email=${values.email}`);
        }catch (error){
            throw error;
        }
    }

    @action refreshToken = async () =>  {
        this.stopRefreshTokenTimer();
        try{
            const user = await agent.user.refreshToken();
            runInAction(() => {
                this.user = user
            });
            this.rootStore.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
        }catch(error){
            console.log(error);
        }
    }

    @action getUser = async () => {
        try{
            const user = await agent.user.current();
            runInAction(() => {
                this.user = user;
            });
            this.rootStore.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
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
                this.startRefreshTokenTimer(user);
                this.rootStore.modalStore.closeModal();
                this.loading = false;
            });
            history.push("/activities");
        }catch(error){
            throw error
        }
    }

    private startRefreshTokenTimer(user:IUser){
        const jwtToken = JSON.parse(atob(user.token.split('.')[1]));
        const expires = new Date(jwtToken.exp * 1000);
        const timeOut = expires.getTime() - Date.now() - (60 * 1000); // e.g: if token expiration is in 2 minitues timeout is 1 minitue before expiration time.
        this.refreshTokenTimeOut = setTimeout(this.refreshToken, timeOut);
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeOut);
    }
}