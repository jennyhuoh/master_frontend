import axios from 'axios';

const instance = axios.create({
    // baseURL:'http://localhost:3001/',
    // baseURL: 'http://140.115.126.21:3001',
    baseURL: 'https://c68c-140-115-126-172.ngrok-free.app',
    headers: {
        'X-Powered-By':'Express',
        'Content-Type':'application/json',
        'Access-Control-Allow-Origin':'*'
    },
    timeout:20000,
})
const recordInstance = axios.create({
    // baseURL: 'http://localhost:3001/',
    // baseURL: 'http://140.115.126.21:3001',
    baseURL: 'https://c68c-140-115-126-172.ngrok-free.app',
    headers: {
        'X-Powered-By': 'Express',
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Origin': '*'
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
export const userLogin = data => instance.post('/login', data);
// create or get a user
export const createUser = data => instance.post('/register', data);
// create a group
export const createGroup = data => instance.post('/group', data);
// create a stage
export const createStage = async (data) => {
    const response = await instance.post('/stage', data)
    const datas = await response.data;
    return datas;
};
// Create new teams in a stage
export const createTeams = async ({id, teams}) => {
    const response = await instance.post(`/stage/${id}/teams`, teams);
    const data = await response.data;
    return data;
}
// Create a new activity
export const createActivity = async ({id, activity}) => {
    const response = await instance.post(`/group/${id}/activity`, activity);
    const data = await response.data;
    return data;
}
// Create a record
export const createRecord = ({stageId, teamId, data}) => recordInstance.post(`stage/${stageId}/team/${teamId}/record`, data);

// get all users
export const getAllUsers = async() => {
    const response = await instance.get('/users')
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
    const response = await instance.get(`/groups/${userId}`)
    const data = await response.data;
    return data;
}
// get a group info
export const getGroupInfo = async(groupId) => {
    const response = await instance.get(`/group/${groupId}`)
    const data = await response.data;
    return data;
}
// get teams for a stage
export const getTeams = async (id) => {
    const response = await instance.get(`/stage/${id}/teams`);
    const data = await response.data;
    const teams = await data.teams;
    return teams;
}
// Get activities from a group
export const getActivities = async (id) => {
    const response = await instance.get(`/group/${id}/activities`);
    const data = await response.data;
    return data
}
// Get recordings
export const getRecordings = async ({stageId, teamId}) => {
    const response = await recordInstance.get(`/stage/${stageId}/team/${teamId}/records`);
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
    const response = await instance.get(`/activity/${id}`);
    const data = await response.data;
    return data;
}
// Get single user's activities
export const getUserActivities = async(id) => {
    const response = await instance.get(`/${id}/activities`);
    const data = await response.data;
    return data;
}
// Get usable teamTemplates
export const getTemplates = async({id, userId}) => {
    // console.log('userId', userId)
    const response = await instance.get(`/group/${id}/${userId}/activity/stage/teamTemplate`);
    const data = await response.data;
    return data
}

// Delete a stage
export const deleteStage = (id, data) => instance.delete(`/stage/${id}`, data);
// delete an activity
export const deleteActivity = (id, data) => instance.delete(`/activity/${id}`, data);
// delete a group
export const deleteGroup = (id, data) => instance.delete(`/group/${id}`, data);

// Update a group
export const updateGroup = async ({id, groupInfo}) => {
    const response = await instance.post(`/group/${id}`, groupInfo);
    const data = await response.data;
    return data;
}
// Save stages sequence
export const saveStagesSequence = (data) => instance.post('/stages', data);
// Edit a stage
export const editStage = async ({id, stage}) => {
    const response = await instance.post(`/stage/${id}`, stage);
    const data = await response.data;
    return data
};
// Update an activity
export const updateActivity = async ({id, info}) => {
    const response = await instance.post(`/activity/${id}`, info);
    const data = await response.data;
    return data
}












export const getVideoSDKAuthToken = data => instance.get('/get-token', data);
export const postCreateMeetingId = async (token, data) => {
    await axios.post('http://localhost:3001/create-meeting/', {token:`${token}`}, {
        headers: {
            "Content-Type": "application/json",
            authorization: `${token}`,
        },
    }, data)
    .then((res) => {
        console.log(res.data.roomId)
        localStorage.setItem('meetingId', res.data.roomId)
        return res.data
    })
}
// export const getRecordings = async (token, roomId, data) => {
//     await axios.get('http://localhost:3001/get-recordings', {token:`${token}`, roomId: `${roomId}`}, {
//         headers: {
//             "Content-Type": "application/json",
//             Authorization: `${token}`,
//         },
// }, data)
// .then((res) => {
//     console.log(res.data)
// })
// }
// export const getRecordings = async ({token, roomId}) => { 
//     const response = await axios.get(`https://api.videosdk.live/v2/recordings?roomId=${roomId}`, {
//         headers: {
//             "Content-Type": "application/json",
//             authorization: `${token}`,
//         },
//     })
//     console.log(response)
//     return response.data
// }