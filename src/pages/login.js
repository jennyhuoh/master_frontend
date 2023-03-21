// import PostsList from "../features/posts/postsList";
import { useKeycloak } from '@react-keycloak/web';
import { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Groups2TwoTone, PersonOutlineTwoTone } from '@mui/icons-material';
import { useMutation } from 'react-query';
import Home from './home';
import { createOrGetUser } from '../features/api';

export default function Login() {
    const { keycloak } = useKeycloak();
    const [ flag, setFlag ] = useState(0);
    const { mutate } = useMutation(createOrGetUser, {
        onSuccess: async(res) => {
            localStorage.setItem('userEmail',res.data.userEmail);
            localStorage.setItem('userName', res.data.userName);
            localStorage.setItem('role', res.data.userRole);
        }
    })

    useEffect(() => {
        if(keycloak.authenticated){
            keycloak.loadUserInfo().then((result) => {
                mutate({
                    userName: result.family_name + result.given_name,
                    userEmail: result.email,
                    userRole: localStorage.getItem('role')
                })
                localStorage.setItem('smallName', result.given_name);
            })
        }
    }, [flag])

    useEffect(() => {
        if(keycloak.authenticated){setFlag(1)}
    }, [keycloak.authenticated])

    const onClickStudent = () => {
        keycloak.login();
        localStorage.setItem('role', 'student');
    }
    const onClickTeacher = () => {
        keycloak.login();
        localStorage.setItem('role', 'teacher');
    }

    return(
        <>
        {keycloak.authenticated ?
            <>
            <Home />
            </>
            :
            <Box style={{width:'100vw', height:'100vh', display:'flex', justifyContent:'center', alignItems:'center'}} sx={{backgroundColor:'#2B3143'}}>
                <Box style={{width:'35%', height:'34%', backgroundColor:'white', fontSize:'2.6vw', fontWeight:'semi-bold', borderRadius:'10px', padding:'40px', display:'flex', alignItems:'center', flexDirection:'column', marginTop:0}}>
                    登入身份
                    <Box style={{display:'flex', marginTop:'60px', width:'100%', display:'flex', alignItems:'center', justifyContent:'space-around'}}>
                        <Button style={{width:'40%', height:'100%', display:'flex', alignItems:'center', flexDirection:'column', padding:'20px'}} variant="contained" onClick={onClickStudent}>
                            <Groups2TwoTone style={{marginBottom:'10px'}} />
                            <Typography style={{fontWeight:'bold', fontSize:'1.5vw'}} >學生</Typography>
                        </Button>
                        <Button style={{width:'40%', height:'100%', display:'flex', alignItems:'center', flexDirection:'column', padding:'20px'}} variant="contained" onClick={onClickTeacher}>
                            <PersonOutlineTwoTone />
                            <Typography style={{fontWeight:'bold', fontSize:'1.5vw'}} >老師</Typography>
                        </Button>
                    </Box>
                </Box>
            </Box>
        }
        </>
        // <Box>
        //     <Header />
            
        //     <Button variant="contained" component={Link} to="/meetingRoom">Go to the meeting</Button>

        //     <Button variant="contained" component={Link} to="/audioRoom">Go to the audioRoom</Button>
        //     <Button variant="contained" component={Link} to="/home">Go home</Button>
        // </Box>
    );
}