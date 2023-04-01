import axios from 'axios';

const instance = axios.create({
    baseURL:'http://localhost:3001/',
    headers: {
        'X-Powered-By':'Express',
        'Content-Type':'application/json',
        'Access-Control-Allow-Origin':'*',
    },
    timeout:20000,
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

// create or get a user
export const createOrGetUser = data => instance.post('/user', data);
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
// create a group
export const createGroup = data => instance.post('/group', data);
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
// create a stage
export const createStage = async (data) => {
    const response = await instance.post('/stage', data)
    const datas = await response.data;
    return datas;
};
// Delete a stage
export const deleteStage = (id, data) => instance.delete(`/stage/${id}`, data);
// Update a group
export const updateGroup = (id, data) => instance.post(`/group/${id}`, data);
// Save stages sequence
export const saveStagesSequence = (data) => instance.post('/stages', data);








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
export const getRecordings = async ({token, roomId}) => { 
    const response = await axios.get(`https://api.videosdk.live/v2/recordings?roomId=${roomId}`, {
        headers: {
            "Content-Type": "application/json",
            authorization: `${token}`,
        },
    })
    console.log(response)
    return response.data
}