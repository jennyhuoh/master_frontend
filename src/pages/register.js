import { useEffect, useState } from 'react';
import { Box, Button, Typography, Radio, TextField, InputAdornment, IconButton } from '@mui/material';
import { useMutation } from 'react-query';
import Home from './home';
import { createUser } from '../features/api';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function Register() {
    let navigate = useNavigate();
    const [radioValue, setRadioValue] = useState('student');
    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [userName, setUserName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showFirstPassword, setShowFirstPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { mutate } = useMutation(createUser, {
        onSuccess: async(res) => {
            console.log('res', res);
            localStorage.setItem('userId', res.data.id);
            localStorage.setItem('userEmail',res.data.userEmail);
            localStorage.setItem('userName', res.data.userName);
            localStorage.setItem('role', res.data.userRole);
            localStorage.setItem('loginAuthenticated', 'true');
        },
        onError: async(msg) => {
            if(msg.response.data.status === 1) {
                alert('電子郵件已被使用!請換一個吧')
            }
        }
    })

    useEffect(() => {
        if(localStorage.getItem('loginAuthenticated') === 'true') {
            navigate('/home')
        }
    }, [localStorage.getItem('loginAuthenticated')])

    const onClickRegister = () => {
        if((userEmail !== '') && (userPassword !== '') && (userName !== '') && (confirmPassword !== '')) {
            if(userPassword === confirmPassword) {
                mutate({
                    userName: userName,
                    userEmail: userEmail,
                    userRole: radioValue,
                    userPassword: userPassword
                })
            } else {
                alert('密碼與確認密碼內容不相同哦')
            }
        } else {
            alert('欄位不可為空!')
        }
    }

    return(
        <Box>
            <Box style={{width:'100vw', height:'100vh', display:'flex', justifyContent:'center', alignItems:'center'}} sx={{backgroundColor:'#2B3143'}}>
                <Box style={{width:'30%', height:'62%', backgroundColor:'white', borderRadius:'10px', padding:'40px 60px', display:'flex', alignItems:'center', flexDirection:'column', marginTop:0}}>
                    <Typography style={{alignSelf:'flex-start', fontSize:'2vw', fontWeight:'bold'}}>註冊</Typography>
                    <Box style={{display:'flex', width:'100%'}}>
                        <Box style={{display:'flex', width:'50%', alignItems:'center'}}>
                            <Radio
                                checked={radioValue === 'student'}
                                onChange={(e) => setRadioValue(e.target.value)}
                                value="student"
                                name="login-types"
                                color="default"
                            />
                            學生
                        </Box>
                        <Box style={{display:'flex',width:'50%', alignItems:'center', justifyContent:'center'}}>
                            <Radio
                                checked={radioValue === 'teacher'}
                                onChange={(e) => setRadioValue(e.target.value)}
                                value="teacher"
                                name="login-types"
                                color="default"
                            />
                            老師
                        </Box>
                    </Box>
                    <TextField style={{width:'100%', marginTop:'20px'}} InputLabelProps={{shrink:true,}} variant="standard" label="1.姓名(請填寫真實姓名)" color="warning" required value={userName} onChange={(e) => setUserName(e.target.value)} />
                    <TextField type='email' style={{width:'100%', marginTop:'20px'}} InputLabelProps={{shrink:true,}} variant="standard" label="2.帳號(電子郵件)" color="warning" required value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                    <TextField 
                        style={{width:'100%', marginTop:'20px'}} 
                        InputLabelProps={{shrink:true,}} 
                        variant="standard" 
                        label="3.密碼" 
                        color="warning" 
                        required 
                        value={userPassword} 
                        onChange={(e) => setUserPassword(e.target.value)}
                        type={showFirstPassword ? 'text' : 'password'}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowFirstPassword(!showFirstPassword)}
                                    edge="end"
                                  >
                                    {showFirstPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                            )
                        }} 
                    />
                    <TextField
                        style={{width:'100%', marginTop:'20px'}} 
                        InputLabelProps={{shrink:true,}} 
                        variant="standard" label="4.密碼確認" 
                        color="warning" 
                        required 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        type={showConfirmPassword ? 'text' : 'password'}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    edge="end"
                                  >
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                            )
                        }} 
                    />
                    <Button onClick={onClickRegister} variant="contained" style={{fontWeight:'bold', width:'100%', marginTop:'30px' }}>註冊</Button>
                    <Button onClick={() => navigate('/')} variant="contained" color='secondary' style={{fontWeight:'bold', marginTop:'12px', width:'100%'}}>前往登入</Button> 
                </Box>
            </Box> 
        </Box> 
    );
}