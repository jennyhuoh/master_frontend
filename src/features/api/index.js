import axios from 'axios';

const instance = axios.create({
    // baseURL:'http://localhost:8000/',
    // baseURL: 'http://140.115.126.21:3001',
    baseURL: 'https://ocd.tornadoedge.app',
    headers: {
        'X-Powered-By':'Express',
        'Content-Type':'application/json',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Methods':'POST, GET, PUT, DELETE',
        'Access-Control-Max-Age': 26400,
        // "ngrok-skip-browser-warning": true,
        // Origin: window.location.origin
    },
    timeout:20000,
})
const recordInstance = axios.create({
    // baseURL: 'http://localhost:8000/',
    // baseURL: 'http://140.115.126.21:3001',
    baseURL: 'https://ocd.tornadoedge.app',
    headers: {
        'X-Powered-By': 'Express',
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE',
        'Access-Control-Max-Age': 26400,
        // "ngrok-skip-browser-warning": true,
        // Origin: window.location.origin
    },
    timeout: 20000,
})

instance.interceptors.response.use(
    function(response) {
        return response;
    },
    function(error) {
        if(error.response) {
            switch(error.response.status) {
                case 404:
                    console.log('頁面不存在')
                    break
                case 500:
                    console.log('程式發生問題')
                    break
                default:
                    console.log('other error')
            }
        }
        return Promise.reject(error);
    }
)

// User Login
export const userLogin = data => instance.post('/api/login', data);
// create or get a user
export const createUser = data => instance.post('/api/register', data);
// create a group
export const createGroup = data => instance.post('/api/group', data);
// create a stage
export const createStage = async (data) => {
    const response = await instance.post('/api/stage', data)
    const datas = await response.data;
    return datas;
};
// Create new teams in a stage
export const createTeams = async ({id, teams}) => {
    const response = await instance.post(`/api/stage/${id}/teams`, teams);
    const data = await response.data;
    return data;
}
// Create a new activity
export const createActivity = async ({id, activity}) => {
    const response = await instance.post(`/api/group/${id}/activity`, activity);
    const data = await response.data;
    return data;
}
// Create a record
export const createRecord = ({stageId, teamId, data}) => recordInstance.post(`/api/stage/${stageId}/team/${teamId}/record`, data);

// get all users
export const getAllUsers = async() => {
    const response = await instance.get('/api/users')
    const data = await response.data;
    var result = []
    await Promise.all(data.map((user) => {
        // console.log(user.id)
        if(user.userName !== localStorage.getItem('userName')){
            const transformedUser = {
                value: user.id,
                label: user.userName
            }
            result.push(transformedUser);
        }
    }))
    return result;
};
// get all groups
export const getAllGroups = async (userId) => {
    const response = await instance.get(`/api/groups/${userId}`)
    const data = await response.data;
    return data;
}
// get a group info
export const getGroupInfo = async(groupId) => {
    const response = await instance.get(`/api/group/${groupId}`)
    const data = await response.data;
    return data;
}
// get teams for a stage
export const getTeams = async (id) => {
    const response = await instance.get(`/api/stage/${id}/teams`);
    const data = await response.data;
    const teams = await data.teams;
    return teams;
}
// Get activities from a group
export const getActivities = async (id) => {
    const response = await instance.get(`/api/group/${id}/activities`);
    const data = await response.data;
    return data
}
// Get recordings
export const getRecordings = async ({stageId, teamId}) => {
    const response = await recordInstance.get(`/api/stage/${stageId}/team/${teamId}/records`);
    const data = await response.data;
    console.log('getRecording response', data);
    let result = [];
    await Promise.all(data.map(async (item) => {
        let allInfo = await item
        const raw = window.atob(item.recordings)
        const binaryData = new Uint8Array(new ArrayBuffer(raw.length));
        for(let i = 0; i < raw.length; i++){
            binaryData[i] = raw.charCodeAt(i);
        }
        const blob = new Blob([binaryData], {'type': 'audio/wav'});
        const url = URL.createObjectURL(blob);
        allInfo.recordingUrl = url;
        result.push(allInfo);
    }))
    return result;
}
// Get an activity
export const getAnActivity = async (id) => {
    const response = await instance.get(`/api/activity/${id}`);
    const data = await response.data;
    return data;
}
// Get single user's activities
export const getUserActivities = async(id) => {
    const response = await instance.get(`/api/${id}/activities`);
    const data = await response.data;
    return data;
}
// Get usable teamTemplates
export const getTemplates = async({id, userId}) => {
    // console.log('userId', userId)
    const response = await instance.get(`/api/group/${id}/${userId}/activity/stage/teamTemplate`);
    const data = await response.data;
    return data
}

// Delete a stage
export const deleteStage = (id, data) => instance.delete(`/api/stage/${id}`, data);
// delete an activity
export const deleteActivity = (id, data) => instance.delete(`/api/activity/${id}`, data);
// delete a group
export const deleteGroup = (id, data) => instance.delete(`/api/group/${id}`, data);

// Update a group
export const updateGroup = async ({id, groupInfo}) => {
    const response = await instance.post(`/api/group/${id}`, groupInfo);
    const data = await response.data;
    return data;
}
// Save stages sequence
export const saveStagesSequence = (data) => instance.post('/api/stages', data);
// Edit a stage
export const editStage = async ({id, stage}) => {
    const response = await instance.post(`/api/stage/${id}`, stage);
    const data = await response.data;
    return data
};
// Update an activity
export const updateActivity = async ({id, info}) => {
    const response = await instance.post(`/api/activity/${id}`, info);
    const data = await response.data;
    return data
}

