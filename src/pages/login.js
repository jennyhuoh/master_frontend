// import PostsList from "../features/posts/postsList";
import { useKeycloak } from '@react-keycloak/web';
import { useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import Header from '../components/header';

export default function Login() {
    return(
        <Box>
            <Header />
            
            <Button variant="contained" component={Link} to="/meetingRoom">Go to the meeting</Button>

            <Button variant="contained" component={Link} to="/audioRoom">Go to the audioRoom</Button>
            <Button variant="contained" component={Link} to="/home">Go home</Button>
        </Box>
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