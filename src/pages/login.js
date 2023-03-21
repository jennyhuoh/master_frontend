// import PostsList from "../features/posts/postsList";
import { useKeycloak } from '@react-keycloak/web';
import { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import Header from '../components/header';
import Home from './home';
import { ConstructionOutlined } from '@mui/icons-material';

export default function Login() {
    const { keycloak } = useKeycloak();
    const [ flag, setFlag ] = useState(0);
    useEffect(() => {
        if(keycloak.authenticated){
            keycloak.loadUserInfo().then((result) => {
                console.log(result)
                localStorage.setItem('userEmail', result.email);
                localStorage.setItem('userName', result.family_name + result.given_name);
            })
        }
    }, [flag])
    useEffect(() => {
        if(keycloak.authenticated){setFlag(1)}
    }, [keycloak.authenticated])
    return(
        <>
        {keycloak.authenticated ?
            <>
            <Home />
            </>
            :
            <Button variant="contained" onClick={() => keycloak.login()}>Login</Button>
        }
        </>
        
        // <Box>
        //     <Header />
            
        //     <Button variant="contained" component={Link} to="/meetingRoom">Go to the meeting</Button>

        //     <Button variant="contained" component={Link} to="/audioRoom">Go to the audioRoom</Button>
        //     <Button variant="contained" component={Link} to="/home">Go home</Button>
        // </Box>
    );
// const { keycloak, initialized } = useKeycloak()
// useEffect(() => {
//     console.log(keycloak.authenticated)
// }, [keycloak])
 
    // return keycloak.authenticated ? (
    //     <button type="button" onClick={() => keycloak.logout()}>Logout</button>
    // ) : (
    //     <button
    //         type="button"
    //         onClick={() => keycloak.login()}
    //     >Login</button>
    // );
    // return(
        
    //     <div>
    //         {/* {keycloak.loadUserInfo} */}
    //         {`User is ${!keycloak.authenticated ? 'NOT ' : ''}authenticated`}
    //         {!keycloak.authenticated && (
    //             <button
    //                 type="button"
    //                 onClick={() => keycloak.login()}
    //             >Login</button>
    //         )}
    //     </div>
    // );
}