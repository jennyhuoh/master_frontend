import { Box, Card, CardContent, Button, Typography, Grid, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import { MoreHoriz, AddCircleOutline } from "@mui/icons-material";
import Header from '../components/header.js';


export default function Home() {
    // console.log(localStorage.getItem('role') === 'teacher');
    if(true) {
        return(
            <Box style={{backgroundColor:'#EEF1F4', height:'100vh'}}>
                <Header />
                <Box style={{padding:'12vh 40px'}}>
                    <Box>
                        <Typography style={{fontSize:'20px', fontWeight:'bold', marginBottom:'18px'}}>討論活動群組</Typography>
                        <Box
                            sx={{
                                display: 'grid',
                                columnGap: 3,
                                rowGap: 3,
                                gridTemplateColumns: 'repeat(11, 220px)',
                                gridTemplateRows: '150px 150px',
                                gridAutoFlow: 'column',
                                overflowX:'scroll',
                                padding:'5px 0'
                            }}
                            >
                            <Button component={Link} to="/addGroup" variant="contained" color="secondary" style={{width: 220, height: 150, borderRadius:'5px', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', border:'1.5px #BEBEBE dashed'}}>
                                <AddCircleOutline color="disabled" style={{fontSize:'55px', marginBottom:'8px'}} />
                                <Typography color="gray">新增討論活動群組</Typography>
                            </Button> 
                            <Card sx={{ width: 220, height: 150, borderRadius:'5px' }}>
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
                            {Array.from(Array(20)).map((_, index) => (
                                    <Box key={index} style={{backgroundColor:'pink'}}>xs=2{index}</Box>
                            ))}
                        </Box>

                        {/* 放所有討論活動 */}
                       

                    </Box>
                    <Box>
                        <Typography style={{fontSize:'20px', fontWeight:'bold', marginBottom:'18px', marginTop:'4vh'}}>單一討論活動</Typography>
                    </Box>
                </Box>
            </Box>
        );
    } else {
        return(<Box></Box>);
    }
}