import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
    url: "http://localhost:10001/auth/",
    realm: "wulab",
    clientId: "online-meeting-cooperation"
})

export default keycloak;


// import { useState, useEffect } from "react";
// import keycloakJson from './pages/keycloak.json';

// export default function KeycloakPage() {
//     const [keycloakContent, setKeycloakContent] = useState(null);
//     const [authenticated, setAuthenticated] = useState(false);

//     const keycloak = new Keycloak(keycloakJson);

//     useEffect(() => {
//         console.log(keycloak);
//         keycloak.init({onLoad: 'login-required'}).then(authenticated => {
//         setKeycloakContent(keycloak);
//         setAuthenticated(authenticated);
//         // if(authenticated){
//         //     window.accessToken = keycloak.token;
//         // }
//         })
//     }, []);

//     return(
//         (keycloakContent) ?
//         (authenticated) ? 
//             <div>You are logged in.</div>
//          : <div>Unable to initiate auth!</div> 
//         : <div>Keycloak initializing in a moment...</div> 
//     );
// }