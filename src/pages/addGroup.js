import { Box, IconButton, Paper, TextField, Button, Alert, Snackbar } from '@mui/material';
import { ArrowBackIosNew } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import React,{ useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';
import { getAllUsers, createGroup } from '../features/api';
import Header from '../components/header';
import dayjs from 'dayjs';
import Select from 'react-select';

const Alerts = React.forwardRef((props, ref) => {
    return <Alert elevation={6} ref={ref} {...props} />
})

export default function AddGroup () {
    let navigate = useNavigate();
    const ref = React.createRef();
    const [groupEndTime, setGroupEndTime] = useState(dayjs().add(1, 'year').format('YYYY-MM-DD'));
    const [selectedMembers, setSelectedMembers] = useState('');
    const [groupName, setGroupName] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const {data, error, isLoading} = useQuery('allUsers', getAllUsers);
    const {mutate} = useMutation(createGroup, {
        onSuccess: () => {
            setSuccessOpen(true);
        }
    })
    const options = data;
    const hostOption = [{value:localStorage.getItem('userEmail'), label:localStorage.getItem('userName')}]

    useEffect(() => {
        if(successOpen) {
            const timer = setTimeout(() => {
                navigate('/home');
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [successOpen])

    const onClickCreateGroup = async () => {
        var members = [{id:localStorage.getItem('userId'), isOwner: true}];
        if((selectedMembers.length !== 0) && (groupName !== '')){
            await Promise.all(selectedMembers.map((member) => {
                const data = {
                    id: member.value,
                    isOwner: false
                }
                members.push(data)
            }))
            const data = {
                groupName: groupName,
                groupExpiryDate: groupEndTime,
                members: members
            }
            mutate(data)
        } else {
            setAlertOpen(true);
        }
    }
    const onCloseAlert = (event, reason) => {
        if(reason === 'clickaway') {
            return;
        }
        setAlertOpen(false);
    }

    return(
        <Box style={{backgroundColor:'#EEF1F4', height:'100vh'}}>
            <Header />
            <Box style={{padding:'12vh 40px'}}>
                <IconButton style={{color:'black', marginBottom:'5px'}} component={Link} to='/home'><ArrowBackIosNew sx={{fontSize:'1.5vw'}} /></IconButton><span style={{fontWeight:'bold', fontSize:'20px', marginLeft:'10px'}}>新增討論活動群組</span>    
                <Box style={{display:'grid'}}>
                    <Paper style={{marginTop:'26px', backgroundColor:'white', padding:'3.8vw 7vw 74px 7vw', width:'32vw',justifySelf:'center', display:'flex', flexDirection:'column', justifyContent:'center', borderRadius:'10px'}}>
                        <TextField style={{width:'35vw', marginTop:'10px'}} InputLabelProps={{shrink:true,}} variant="standard" label="1.群組名稱" color="warning" required value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                        <Box style={{marginTop:'30px'}}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="2.群組結束日期"
                                    value={groupEndTime}
                                    onChange={(value) => setGroupEndTime(value)}
                                    renderInput={(params) => 
                                    <TextField {...params} style={{marginTop:'10px'}} InputLabelProps={{shrink: true}} variant="standard" />}
                                    inputFormat='YYYY/MM/DD'
                                    deaultValue={groupEndTime}
                                    minDate={dayjs().add(1, 'day')}
                                />
                            </LocalizationProvider>
                        </Box>
                        <Box style={{marginTop:'30px'}}>
                            <p style={{color:'grey', fontSize:'4px', marginBottom:'10px'}}>3.管理者</p>
                            <Select
                             options={hostOption}
                             defaultValue={hostOption[0]}
                            />
                        </Box>
                        <Box style={{marginTop:'30px'}}>
                            <p style={{color:'grey', fontSize:'4px', marginBottom:'10px'}}>4.參與討論成員</p>
                                <Select
                                options={options}
                                isMulti
                                required
                                onChange={(values) => setSelectedMembers(values)}
                            />
                        </Box>
                        <Box style={{marginTop:'30px', display:'flex', justifyContent:'flex-end'}}>
                            <Button variant="contained" color='primary' onClick={onClickCreateGroup}>建立</Button>
                        </Box>
                    </Paper>
                </Box>
            </Box>
            <Snackbar open={alertOpen} autoHideDuration={6000} onClose={onCloseAlert}>
                <Alerts ref={ref} onClose={onCloseAlert} severity="error"sx={{width:'28vw'}}>
                    欄位不可為空
                </Alerts>
            </Snackbar>
            <Snackbar open={successOpen} autoHideDuration={6000} onClose={onCloseAlert}>
                <Alerts ref={ref} onClose={onCloseAlert} severity="success"sx={{width:'28vw'}}>
                    成功新增討論活動群組!
                </Alerts>
            </Snackbar>
        </Box>
    );
}