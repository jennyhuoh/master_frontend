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