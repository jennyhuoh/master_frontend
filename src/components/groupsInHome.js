import { Box, Card, CardContent, Button, Typography, Grid, IconButton, Badge, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import { MoreHoriz, AddCircleOutline, Event, People } from "@mui/icons-material";
import { getAllGroups } from "../features/api/index.js";
import { useQuery } from "react-query";
import { useState, useEffect } from 'react';
import AvatarGroup from 'react-avatar-group';

const Groups = (props) => {
    var memberArr = [];
    const a = props.members.map((member) => {
        memberArr.push(member.userName);
    })


    
    return(
        <Card sx={{ width: 200, height: 130, borderRadius:'5px',padding:'10px' }}>
            <CardContent xs={{paddingBottom:'0'}}>
                <Grid container>
                    <Grid item xs={10}><Typography style={{fontSize:'16px', fontWeight:'bold'}} component="div">
                        <Badge badgeContent={4} color="primary" style={{marginRight:'15px', marginTop:'-5px'}}>
                            <Event fontSize="small" sx={{color:'grey'}} />
                        </Badge>               
                        {props.name}
                    </Typography></Grid>
                    <Grid item xs={2} style={{marginTop:'-5px'}}><IconButton size="small" component={Link} to={`/group/${props.meetingId}`}><MoreHoriz sx={{color:'grey'}} /></IconButton></Grid>
                </Grid>
                <Box sx={{mb:1, mt:1}} style={{display:'flex'}}>
                    <People sx={{color:'grey', mr:1.5, mt:0.5}} fontSize="small"  />
                    <AvatarGroup
                        avatars={memberArr}
                        initialCharacters={2}
                        max={3}
                        size={28}
                        shadow={2}
                        fontSize={0.4}
                        backgroundColor='random'
                    />
                </Box>
                <Box style={{display:'flex'}} sx={{mt:2}}>
                    <Typography style={{fontSize:'12px', fontWeight:'bold'}}>
                        截止日期:  
                    </Typography>
                    <Typography style={{fontSize:'12px', letterSpacing:'1px'}} sx={{ml:'5px'}}> {props.endTime}</Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

export default function GroupsInHome() {
    const [groups, setGroups] = useState(undefined);
    const userId = localStorage.getItem('userId');
    const {data, isLoading} = useQuery(['groups', userId], () => getAllGroups(userId), {
        onSuccess: () => setGroups(data)
    })
    let num = 5;
    if(groups!=undefined) {
        num = ((groups.length%2)!==0) ? (groups.length+1)/2 : groups.length/2;
    }
    useEffect(() => {
        setGroups(data)
    }, [data])
    // console.log(groups)
    // console.log(localStorage.getItem('role') === 'teacher');
    if(!isLoading) {
    return(
        <Box style={{padding:'12vh 40px'}}>
            <Box>
                <Typography style={{fontSize:'20px', fontWeight:'bold', marginBottom:'18px'}}>討論活動群組</Typography>
                <Box
                    sx={{
                    display: 'grid',
                    columnGap: 3,
                    rowGap: 3,
                    gridTemplateColumns: `repeat(${num}, 220px)`,
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
                    {(groups!=undefined) ? 
                    groups.map((group) => <Groups meetingId={group.groupMeetingId} id={group.id} key={group.groupMeetingId} name={group.groupName} members={group.userProfiles} endTime={group.groupExpiryDate} activityNum={group.activityNum} />)
                    : <CircularProgress color="inherit" /> }
                </Box>

                        {/* 放所有討論活動 */}
                       

            </Box>
            <Box>
                <Typography style={{fontSize:'20px', fontWeight:'bold', marginBottom:'18px', marginTop:'4vh'}}>單一討論活動</Typography>
            </Box>
        </Box>
    );}
}