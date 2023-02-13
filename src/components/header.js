import { Box, Grid, Button, Container } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useKeycloak } from "@react-keycloak/web";

// const Item = styled()(({ theme }) => ({
//   backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
//   ...theme.typography.body2,
//   padding: theme.spacing(1),
//   textAlign: 'center',
//   color: theme.palette.text.secondary,
// }));

export default function Header() {
    const { keycloak } = useKeycloak();
    return(
        <Box>
            <Grid container style={{backgroundColor:'lightgray'}}>
                <Grid item xs={6}>
                    item1
                </Grid> 
                <Grid item xs={6}>
                    {keycloak.authenticated ? 
                        <Button variant="contained" onClick={() => keycloak.logou
                        ()}>Logout</Button> : <Button variant="contained" onClick={() => keycloak.login()}>Login</Button>
                    }
                </Grid>
            </Grid>
        </Box>
    );
}