import { useEffect, useState } from 'react';
import { Box, Button, Typography, Radio, TextField, InputAdornment, IconButton } from '@mui/material';
import { useMutation } from 'react-query';
import { userLogin } from '../features/api';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Home from './home';

export default function Login() {
    let navigate = useNavigate();
    // 還須加上authenticated 判斷
    const [radioValue, setRadioValue] = useState('student');
    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { mutate } = useMutation(userLogin, {
        onSuccess: async(res) => {
            localStorage.setItem('userId', res.data.id);
            localStorage.setItem('userEmail',res.data.userEmail);
            localStorage.setItem('userName', res.data.userName);
            localStorage.setItem('role', res.data.userRole);
            localStorage.setItem('loginAuthenticated', 'true');
        },
        onError: async (msg) => {
            console.log('error msg', msg.response.data.status)
            if(msg.response.data.status === 2) {
                alert('該使用者電子郵件不存在')
            } else if(msg.response.data.status === 3) {
                alert('密碼錯誤')
            }
        }
    })
    useEffect(() => {
        if(localStorage.getItem('loginAuthenticated') === 'true') {
            navigate('/home')
        }
    }, [localStorage.getItem('loginAuthenticated')])

    const onClickLogin = () => {
        if((userEmail !== '') && (userPassword !== '')) {
            mutate({
                userEmail: userEmail,
                userPassword: userPassword
            })
        } else {
            alert('欄位不可為空!')
        }
    }

    return(
        <Box>
            <Box style={{width:'100vw', height:'100vh', display:'flex', justifyContent:'center', alignItems:'center'}} sx={{backgroundColor:'#2B3143'}}>
                <Box style={{width:'30%', height:'40%', backgroundColor:'white', borderRadius:'10px', padding:'40px 60px', display:'flex', alignItems:'center', flexDirection:'column', marginTop:0}}>
                    <Typography style={{alignSelf:'flex-start', fontSize:'2vw', fontWeight:'bold'}}>登入</Typography>
                    <TextField type='email' style={{width:'100%', marginTop:'20px'}} InputLabelProps={{shrink:true,}} variant="standard" label="1.帳號(電子郵件)" color="warning" required value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                    <TextField
                        style={{width:'100%', marginTop:'20px'}} 
                        InputLabelProps={{shrink:true,}} 
                        variant="standard" 
                        label="2.密碼" 
                        color="warning" 
                        required 
                        value={userPassword} 
                        onChange={(e) => setUserPassword(e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                  >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                            )
                        }}    
                    />
                    <Button onClick={onClickLogin} variant="contained" style={{fontWeight:'bold', width:'100%', marginTop:'35px' }}>登入</Button>
                    <Button onClick={() => navigate('/register')} variant="contained" color='secondary' style={{fontWeight:'bold', marginTop:'16px', width:'100%'}}>前往註冊</Button> 
                </Box>
            </Box> 
        </Box> 
    );
}