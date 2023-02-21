import { Box, Card, CardContent, Button, Typography, Grid, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import { MoreHoriz } from "@mui/icons-material";
import Header from '../components/header.js';


export default function Home() {
    if(true) {
        return(
            <Box>
                <Header />
                <Box>
                    <Box>
                        <Box>討論活動群組</Box>
                        {/* 放所有討論活動 */}
                    <Card sx={{ width: 275 }}>
                        <CardContent xs={{paddingBottom:'0'}}>
                            <Grid container>
                                <Grid item xs={10}><Typography variant="h5" component="div">
                                belent
                                </Typography></Grid>
                                <Grid item xs={2}><IconButton size="small" component={Link} to='/discussGroup'><MoreHoriz sx={{color:'grey'}} /></IconButton></Grid>
                            </Grid>
                            <Typography sx={{ mb: 1.5 }} color="text.secondary">
                            adjective
                            </Typography>
                            <Typography variant="body2">
                            well meaning and kindly.
                            <br />
                            {'"a benevolent smile"'}
                            </Typography>
                            <Box display='flex' justifyContent='flex-end'>
                                <Button component={Link} to='/inMeetingRoom' size="small">Learn More</Button>
                            </Box>
                        </CardContent>
                    </Card>
                    </Box>
                    <Box>
                        <Box>單一討論活動</Box>
                    </Box>
                </Box>
            </Box>
        );
    } else {
        return(<Box></Box>);
    }
}