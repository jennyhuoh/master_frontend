import { TextField, Box, Grid, Button, Paper, IconButton, CircularProgress } from "@mui/material";
import { ArrowBackIosNew } from "@mui/icons-material";
import { useState, useEffect } from 'react';
import { DatePicker, LocalizationProvider, } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Link } from "react-router-dom";
import { useQuery } from 'react-query';
import { getGroupInfo } from "../features/api";
import dayjs from "dayjs";
import Select from 'react-select';

export default function DiscussGroupInfo(appProps) {
    const [groupInfo, setGroupInfo] = useState(undefined);
    const groupId = appProps.groupId;
    const {data, isLoading} = useQuery(['info', groupId], () => 
    getGroupInfo(groupId), {
        onSuccess:async () => {
            setGroupInfo(data)
    }});
    const hostOption = (groupInfo!=undefined) ? [{value:groupInfo.owner.userEmail, label:groupInfo.owner.userName}] : []
    const memberOption = (groupInfo!=undefined) ? groupInfo.member : []
    const [groupEndTime, setGroupEndTime] = useState(dayjs().add(1, 'year').format('YYYY/MM/DD'));

    // 是否為管理者
    if(groupInfo!=undefined) {
        return(
            <Box m={'0 3vw 2vw 3vw'} sx={{pt:'12vh'}}>
                <IconButton style={{color:'black', marginBottom:'5px'}} component={Link} to='/home'><ArrowBackIosNew sx={{fontSize:'1.5vw'}} /></IconButton><span style={{fontWeight:'bold', fontSize:'2vw', marginLeft:'10px'}}>{groupInfo.groupName}</span>
                {/* 群組資訊 */}
                <Paper style={{marginTop:'15px', backgroundColor:'white', padding:'2vw'}}>
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
                        <Grid item xs={6}>
                            <p style={{color:'grey', fontSize:'4px'}}>4.參與討論成員</p>
                            <Select
                             options={memberOption}
                             defaultValue={memberOption}
                             isMulti    
                            //  onChange={(values) => setSelectedMembers(values)}
                            />
                        </Grid>
                    </Grid>
                    <Box style={{display:'flex', justifyContent:'flex-end', paddingRight:'20px'}}>
                        <Button variant="outlined" color='error'>刪除</Button>
                        {/* <Button variant="contained" color='primary' style={{marginLeft:'20px'}}>儲存更改</Button> */}
                    </Box>
                </Paper>
            </Box>
        );
    } else {
        return(
            <Box m={'12vh 3vw 2vw 3vw'}>
                <CircularProgress color="inherit" />
            </Box>
        );
    }
    
}