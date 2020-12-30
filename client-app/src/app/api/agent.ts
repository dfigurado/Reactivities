import axios, {AxiosResponse} from 'axios';
import {toast} from 'react-toastify';
import {history} from '../..';
import {IPhoto} from "../models/profile";
import {IProfile} from '../models/profile';
import {IActivity, IActivityEnvelope} from '../models/activity';
import {IUser, IUserFormValues} from '../models/user';

axios.defaults.baseURL = 'http://localhost:5000/api';

axios.interceptors.request.use((config) => {
    const token = window.localStorage.getItem('jwt'); // Lookup local storage for jwt token
    if (token)
        config.headers.Authorization = `Bearer ${token}`; //Attach jwt token to request header.
    return config;
}, error => {
    return Promise.reject(error)
});

// Intercept exceptions from API
axios.interceptors.response.use(undefined, error => {
    if (error.message === 'Network error' && !error.respons) {
        toast.error('Error: Network Error');
    }

    const {status, data, config} = error.response;

    if (status === 404) {
        history.push('/notfound');
    }

    if (status === 400 && config.method === 'get' && data.errors.hasOwnProperty('id')) {
        history.push('/notfound');
    }

    if (status === 500) {
        toast.error('Server error - check the terminal for more details.');
    }

    throw error.response;
});

const responseBody = (response: AxiosResponse) => response.data;

const sleep = (ms: number) => (response: AxiosResponse) =>
    new Promise<AxiosResponse>(resolve => setTimeout(() => resolve(response), ms)); //curing. 

const requests = {
    get: (url: string) => axios.get(url).then(sleep(1000)).then(responseBody),
    post: (url: string, body: {}) => axios.post(url, body).then(sleep(1000)).then(responseBody),
    put: (url: string, body: {}) => axios.put(url, body).then(sleep(1000)).then(responseBody),
    del: (url: string) => axios.delete(url).then(sleep(1000)).then(responseBody),
    postForm: (url: string, file: Blob) => {
        let formData = new FormData();
        formData.append('File', file);
        return axios.post(url, formData, {
            headers: {'Content-type': 'multipart/form-data'}
        }).then(responseBody)
    }
}

const activities = {
    list: (params: URLSearchParams): Promise<IActivityEnvelope> =>
        axios.get('/activities', {params: params}).then(sleep(1000)).then(responseBody),
    details: (id: string) => requests.get(`/activities/${id}`),
    create: (activity: IActivity) => requests.post('/activities', activity),
    update: (activity: IActivity) => requests.put(`/activities/${activity.id}`, activity),
    delete: (id: string) => requests.del(`/activities/${id}`),
    attend: (id: string) => requests.post(`/activities/${id}/attend`, {}),
    unattend: (id: string) => requests.del(`/activities/${id}/attend`)
}

const user = {
    current: (): Promise<IUser> => requests.get('/user'),
    login: (user: IUserFormValues): Promise<IUser> => requests.post(`/user/login`, user),
    register: (user: IUserFormValues): Promise<IUser> => requests.post(`/user/register`, user),
}

const profiles = {
    get: (username: string): Promise<IProfile> => requests.get(`/profiles/${username}`),
    uploadPhoto: (photo: Blob): Promise<IPhoto> => requests.postForm(`/photos`, photo),
    setMainPhoto: (id: string) => requests.post(`/photos/${id}/setMain`, {}),
    deletePhoto: (id: string) => requests.del(`/photos/${id}`),
    updateProfile: (profile: Partial<IProfile>) => requests.put(`/profiles`, profile),
    follow: (username: string) => requests.post(`/profiles/${username}/follow`, {}),
    unfollow: (username: string) => requests.del(`/profiles/${username}/follow`),
    listFollowings: (username: string, predicate: string) => requests.get(`/profiles/${username}/follow?predicate=${predicate}`),
    listActivities:(username:string, predicate:string) => requests.get(`/profiles/${username}/activities?predicate=${predicate}`)
}

export default {
    activities,
    user,
    profiles
}