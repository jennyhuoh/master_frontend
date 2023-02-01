// import PostsList from "../features/posts/postsList";
import { useKeycloak } from '@react-keycloak/web';
import { useEffect } from 'react';

export default function Login() {
const { keycloak, initialized } = useKeycloak()
useEffect(() => {
    console.log(keycloak.authenticated)
}, [keycloak])
    return(
        <div>
            {`User is ${!keycloak.authenticated ? 'NOT ' : ''}authenticated`}
            {!keycloak.authenticated && (
                <button
                    type="button"
                    onClick={() => keycloak.login()}
                >Login</button>
            )}
            {
                !!keycloak.authenticated &&
                <button type="button" onClick={() => keycloak.logout()}>Logout</button>
            }   
        </div>
    );
}