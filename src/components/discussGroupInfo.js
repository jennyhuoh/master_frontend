import { TextField, Box, Grid, Button, Paper, IconButton, CircularProgress, Divider, Alert, Snackbar, Modal, Typography } from "@mui/material";
import { ArrowBackIosNew } from "@mui/icons-material";
import React,{ useState, useEffect } from 'react';
import { DatePicker, LocalizationProvider, } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from 'react-query';
import { getGroupInfo, updateGroup, deleteGroup } from "../features/api";
import dayjs from "dayjs";
import Select from 'react-select';

const Alerts = React.forwardRef((props, ref) => {
    return <Alert elevation={6} ref={ref} {...props} />
})

export default function DiscussGroupInfo(appProps) {
    const [groupInfo, setGroupInfo] = useState(undefined);
    const groupId = appProps.groupId;
    const {data, isLoading} = useQuery(['info', groupId], () => 
    getGroupInfo(groupId), {
        onSuccess:async () => {
            setGroupInfo(data)
        },
        staleTime: Infinity
    });
    useEffect(() => {
        setGroupInfo(data);
    }, [data])

    const hostOption = (groupInfo!=undefined) ? [{value:groupInfo.owner.userEmail, label:groupInfo.owner.userName}] : []
    const memberOption = (groupInfo!=undefined) ? groupInfo.all : []
    const defaultOption = (groupInfo!=undefined) ? groupInfo.member : [] 
    const [groupEndTime, setGroupEndTime] = useState(dayjs().add(1, 'year').format('YYYY/MM/DD'));
    const [alertOpen, setAlertOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    let navigate = useNavigate();
    const {mutate} = useMutation(updateGroup, {
        onSuccess: () => {
            setAlertOpen(true)
            localStorage.setItem('usersNum', selectedMembers.length)
            localStorage.setItem('usersInGroup', JSON.stringify(selectedMembers))
        }
    })
    const {mutate: mutateDelete} = useMutation(deleteGroup, {
        onSuccess: () => {
            navigate('/home');
        }
    })
    const [selectedMembers, setSelectedMembers] = useState(defaultOption);
    let ref = React.createRef();
    useEffect(() => {
        if(groupInfo != undefined) {
            localStorage.setItem('usersNum', groupInfo.member.length);
            localStorage.setItem('usersInGroup', JSON.stringify(groupInfo.member));
        }
    }, [groupInfo])
    const onClickSaveInfo = () => {
        const data = {
            members: selectedMembers
        }
        mutate({
            id: appProps.groupId,
            groupInfo: data
        })
    }
    const onCloseAlert = (event, reason) => {
        if(reason === 'clickaway') {
            return;
        }
        setAlertOpen(false);
    }

    // 是否為管理者
    if(groupInfo!=undefined) {
        return(
            <>
            <Box m={'0 3vw 2vw 3vw'} sx={{pt:'12vh'}}>
                <Box style={{display:'flex', alignItems:'center'}}>
                    <IconButton style={{color:'black'}} component={Link} to='/home'><ArrowBackIosNew sx={{fontSize:'1.5vw'}} /></IconButton>
                    <Typography style={{fontWeight:'bold', fontSize:'2vw', marginLeft:'10px'}}>{groupInfo.groupName}</Typography>
                </Box>
                {/* 群組資訊 */}
                <Paper elevation={3} style={{marginTop:'15px', backgroundColor:'white', padding:'2vw', borderRadius:'10px'}}>
                    <div style={{fontWeight:'bold', fontSize:'1.5vw'}}>基本資訊</div>
                    <Divider style={{margin:'15px 0', borderColor:'#707070'}}/>
                    <Grid container spacing={20} style={{padding:'0 20px'}}>
                        <Grid item xs={6}>
                            <TextField style={{width:'35vw', marginTop:'10px'}} InputLabelProps={{shrink:true,}} variant="standard" label="1.群組名稱" color="warning" value={groupInfo.groupName} />
                        </Grid>
                        <Grid item xs={6}>
                            <p style={{color:'grey', fontSize:'4px'}}>2.管理者</p>
                            <Select
                             options={hostOption}
                             defaultValue={hostOption[0]}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={20} style={{padding:'50px 20px 25px 20px'}}>
                        <Grid item xs={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                label='3.群組結束日期'
                                value={groupInfo.groupExpiryDate}
                                onChange={(value) => setGroupEndTime(value)}
                                renderInput={(params) => <TextField {...params} style={{marginTop:'10px'}} InputLabelProps={{ shrink: true }} variant="standard" />}
                                inputFormat='YYYY/MM/DD'
                                defaultValue={groupInfo.groupExpiryDate}
                                // minDate={dayjs().add(1, 'day')}
                                />
                            </LocalizationProvider>
                        </Grid>
                        {groupInfo?.owner.userName === localStorage.getItem('userName') ?
                        <Grid item xs={6}>
                            <p style={{color:'grey', fontSize:'4px'}}>4.參與討論成員</p>
                            <Select
                             options={memberOption}
                             defaultValue={defaultOption}
                             isMulti    
                             onChange={(values) => setSelectedMembers(values)}
                            />
                        </Grid> :
                        <Grid item xs={6}>
                            <p style={{color:'grey', fontSize:'4px'}}>4.參與討論成員</p>
                            <Select
                                options={memberOption}
                                defaultValue={defaultOption}
                                isMulti
                            />
                        </Grid> 
                        }
                        
                    </Grid>
                    {groupInfo?.owner.userName === localStorage.getItem('userName') &&
                    <Box style={{display:'flex', justifyContent:'flex-end', paddingRight:'20px'}}>
                        <Button variant="outlined" color='error' onClick={() => {setDeleteModalOpen(true)}}>刪除</Button>
                        <Button variant="contained" color='primary' style={{marginLeft:'20px', fontWeight:'bold'}} onClick={onClickSaveInfo}>儲存更改</Button>
                    </Box>
                    }
                </Paper>
            </Box>
            <Snackbar open={alertOpen} autoHideDuration={6000} onClose={onCloseAlert}>
                <Alerts ref={ref} onClose={onCloseAlert} severity="success"sx={{width:'28vw'}}>
                    儲存成功! 
                </Alerts>
            </Snackbar>
            <Modal
            open={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            >
                <Box style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 260, backgroundColor: 'white', boxShadow: 24, padding:'20px 25px', borderRadius:'5px'}}>
                    請問確定要刪除此討論活動群組嗎?
                    <Box style={{display:'flex', marginTop:'25px', justifyContent:'flex-end'}}>
                        <Button variant="outlined" color="error" style={{fontWeight:'bold'}} onClick={() => {mutateDelete(appProps.groupId)}}>確定</Button>
                        <Button variant="contained" color="secondary" style={{fontWeight:'bold', marginLeft:'12px'}} onClick={() => setDeleteModalOpen(false)}>取消</Button>
                    </Box>
                </Box>
            </Modal>
            </>
        );
    } else {
        return(
            <Box m={'12vh 3vw 2vw 3vw'}>
                <CircularProgress color="inherit" />
            </Box>
        );
    }
    
}