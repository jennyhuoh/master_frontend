import { Box, Card, CardContent, Button, Typography, Grid, IconButton, Badge, CircularProgress, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import { MoreHoriz, AddCircleOutline, Event, People, Diversity3, AccessTime } from "@mui/icons-material";
import { getAllGroups, getUserActivities } from "../features/api/index.js";
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
                        <Badge badgeContent={props.activityNum} color="primary" style={{marginRight:'15px', marginTop:'-5px'}} showZero={true}>
                            <Event fontSize="small" sx={{color:'grey'}} />
                        </Badge>               
                        {props.name}
                    </Typography></Grid>
                    <Grid item xs={2} style={{marginTop:'-5px'}}><IconButton size="small" component={Link} to={`/group/${props.meetingId}`}><MoreHoriz sx={{color:'grey'}} /></IconButton></Grid>
                </Grid>
                <Box sx={{mb:1, mt:1}} style={{display:'flex'}}>
                    <People sx={{color:'grey', mr:1.5, mt:0.5}} fontSize="small" />
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
const RecentCard = (props) => {
    const openInNewTab = url => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };
    const onClickStartDiscuss = () => {
        localStorage.setItem('mainRoomId', props.id)
        openInNewTab(`http://localhost:3000/mainRoom/${props.groupMeetingId}/${props.id}`)
        localStorage.setItem('discussType', 'all');
    }
    return(
        <Card sx={{ width: 240, height: 150, borderRadius:'5px',padding:'4px', border:'2px solid #F6BD58'}}>
            <CardContent xs={{paddingBottom:'0', paddingTop:'0'}} style={{display:'flex', flexDirection:'column'}}>
                <Typography style={{fontSize:'16px', fontWeight:'bold'}} component="div">           
                        {props.name}
                </Typography>
                <Box sx={{mb:1, mt:1}} style={{display:'flex'}}>
                    <AccessTime sx={{color:'grey', mr:1}} fontSize="small" />
                    <Typography style={{fontSize:'12px', marginLeft:'4px'}}> {props.startTime}</Typography>
                </Box>
                <Box style={{display:'flex'}}>
                    <Diversity3 sx={{color:'grey', mr:1.5}} fontSize="small" />
                    <Typography style={{fontSize:'14px', letterSpacing:'1px', fontWeight:'bold'}}> {props.groupName}</Typography>
                </Box>
                <Button variant="contained" style={{alignSelf:'end', marginTop:'7px'}} onClick={onClickStartDiscuss}>開始討論</Button>
            </CardContent>
        </Card>
    );
}
export default function GroupsInHome() {
    const [groups, setGroups] = useState(undefined);
    const [recent, setRecent] = useState(undefined);
    const userId = localStorage.getItem('userId');
    const {data: groupsData, isLoading: groupsIsLoading} = useQuery(['groups', userId], () => getAllGroups(userId), {
        onSuccess: () => setGroups(groupsData)
    })
    const {data: recentData} = useQuery(['recents', userId], () => getUserActivities(userId), {
        onSuccess: () => setRecent(recentData)
    })
    let num = 5;
    if(groups!=undefined) {
        num = ((groups.length%2)!==0) ? (groups.length+1)/2 : groups.length/2;
    }
    useEffect(() => {
        setGroups(groupsData)
    }, [groupsData])
    useEffect(() => {
        setRecent(recentData)
    }, [recentData])
    
    if(!groupsIsLoading && localStorage.getItem('role') === 'teacher') {
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
                    {groups ? 
                    groups.map((group) => <Groups meetingId={group.groupMeetingId} id={group.id} key={group.groupMeetingId} name={group.groupName} members={group.userProfiles} endTime={group.groupExpiryDate} activityNum={group.activityNum} />)
                    : <CircularProgress color="inherit" /> }
                </Box>
            </Box>
            <Box>
                <Typography style={{fontSize:'20px', fontWeight:'bold', marginBottom:'18px', marginTop:'4vh'}}>單一討論活動</Typography>
            </Box>
        </Box>
    );} else {
        return(
            <Box style={{padding:'12vh 40px'}}>
                <Box>
                    <Typography style={{fontSize:'20px', fontWeight:'bold', marginBottom:'16px'}}>近期討論活動</Typography>
                    <Stack
                        direction='row'
                        spacing={3}
                        sx={{
                        gridAutoFlow: 'column',
                        overflowX:'scroll'
                    }}
                    > 
                    {recent ? 
                    recent.map((activity) => <RecentCard meetingId={activity.groupMeetingId} id={activity.id} key={activity.groupMeetingId} name={activity.activityName} startTime={activity.activityStartDate} groupName={activity.groupName} />)
                    : <CircularProgress color="inherit" /> }
                    </Stack>
                </Box> 
                <Box>
                    <Typography style={{fontSize:'20px', fontWeight:'bold', marginBottom:'16px', marginTop:'10px'}}>討論活動群組</Typography>
                    <Stack
                        direction='row'
                        spacing={3}
                        sx={{
                        gridAutoFlow: 'column',
                        overflowX:'scroll'
                    }}
                    >
                    {groups ? 
                    groups.map((group) => <Groups meetingId={group.groupMeetingId} id={group.id} key={group.groupMeetingId} name={group.groupName} members={group.userProfiles} endTime={group.groupExpiryDate} activityNum={group.activityNum} />)
                    : <CircularProgress color="inherit" /> }
                    </Stack>
                </Box> 
                <Box>
                    <Typography style={{fontSize:'20px', fontWeight:'bold', marginTop:'10px'}}>單一討論活動</Typography>
                </Box>
            </Box>
        ) 
    }
}