import { Box, Divider, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button, Grid, TextField, Typography, Alert, Snackbar, Modal, Radio } from "@mui/material";
import React,{ useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { v4 as uuid } from 'uuid';
import { Add, AddCircleOutline } from '@mui/icons-material';
import { DatePicker, LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from 'dayjs';



function createData(name, date) {
  return { name, date };
}

const rows = [
  createData('Frozen yoghurt', 159),
  createData('Ice cream sandwich', 237),
  createData('Eclair', 262,),
  createData('Cupcake', 305),
  createData('Gingerbread', 356),
];
const Rows = (props) => {
    const id = uuid();
    return(
    <TableRow
    style={{maxHeight: '10px'}}
    // key={row.name}
    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
        <TableCell style={{width:'38%', verticalAlign:'baseline'}} component="th" scope="row">
            {props.row.name}
        </TableCell>
        <TableCell style={{width:'35%', verticalAlign:'baseline'}} align="center">{props.row.date}</TableCell>
        <TableCell style={{width:'17%', verticalAlign:'baseline'}} align="right">
            <Button variant="contained" component={Link} to={'/mainRoom/'+id}>開始討論</Button>
        </TableCell>
        <TableCell style={{width:'5%', verticalAlign:'baseline'}} align="center">
            <Button variant="contained" color='secondary'>編輯</Button>
        </TableCell>
        <TableCell style={{width:'5%', verticalAlign:'baseline'}} align="center">
            <Button variant="outlined" color='error'>刪除</Button>
        </TableCell>
    </TableRow>
    );
}

const Alerts = React.forwardRef((props, ref) => {
    return <Alert elevation={6} ref={ref} {...props} />
})

export default function ListInGroup() {
    const [displayAddForm, setDisplayAddForm] = useState(true);
    const [startTime, setStartTime] = useState();
    const [activityName, setActivityName] = useState('');
    const [addChildActOpen, setAddChildActOpen] = useState(false);
    const [alertName, setAlertName] = useState(false);
    const [childActName, setChildActName] = useState();
    const [radioValue, setRadioValue] = useState('all');
    let ref = React.createRef();

    const onClickAddChildAct = () => {
        if(activityName!='') {
            setAddChildActOpen(true);
        } else {
            setAlertName(true);
        }
        
    }
    const onCloseAlert = (event, reason) => {
        if(reason === 'clickaway') {
            return;
        }
        setAlertName(false);
    }
    if(true){
    return(
        <>
            {displayAddForm && (
                <Box m={'2vw 3vw 2vw 3vw'}>
                    <Paper style={{marginTop:'15px', backgroundColor:'white', padding:'2vw', marginBottom:'30px'}}>
                        <div style={{fontWeight:'bold', fontSize:'1.5vw'}}>新增討論活動</div>
                        <Divider style={{marginTop:'15px', borderColor:'#707070', marginBottom:'15px'}}/>
                        <Grid container spacing={20} style={{padding:'0 20px'}}>
                            <Grid item xs={6}>
                                <TextField style={{width:'35vw', marginTop:'10px'}} InputLabelProps={{shrink:true,}} variant="standard" label="1.討論活動名稱" color="warning" value={activityName} onChange={(e) => setActivityName(e.target.value)} />
                            </Grid>
                            <Grid item xs={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateTimePicker
                                    label='2.討論活動開始時間'
                                    value={startTime}
                                    onChange={(value) => setStartTime(value)}
                                    renderInput={(params) => <TextField {...params} style={{marginTop:'10px'}} InputLabelProps={{ shrink: true }} variant="standard" />}
                                    inputFormat='YYYY/MM/DD hh:mm a'
                                    // defaultValue={groupInfo.groupExpiryDate}
                                    minDate={dayjs()}
                                    />
                                </LocalizationProvider>
                            </Grid>
                        </Grid>
                        <Grid container spacing={20} style={{padding:'0 20px'}}>
                            <Grid item xs={12} sx={{marginTop:'30px'}}>
                                <p style={{color:'grey', fontSize:'4px', marginBottom:'10px'}}>3.活動規劃</p>
                            <Button variant="contained" color="secondary" style={{width: 180, height: 120, borderRadius:'5px', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', border:'1.5px #BEBEBE dashed'}} onClick={onClickAddChildAct}>
                                <AddCircleOutline color="disabled" style={{fontSize:'55px', marginBottom:'8px'}} />
                                <Typography color="gray" sx={{fontSize:'4px'}}>新增活動</Typography>
                            </Button> 
                            </Grid> 
                        </Grid>
                        <Grid container spacing={20} style={{padding:'0 20px'}}>
                            <Grid item xs={12} sx={{marginTop:'50px', display:'flex', justifyContent:'flex-end'}}>
                                <Button variant="contained" color='secondary' style={{fontWeight:'bold'}}>取消</Button> 
                                <Button variant="contained" style={{fontWeight:'bold', marginLeft:'15px'}}>完成</Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>
            )}
            <Box m={'2vw 3vw 2vw 3vw'}>
            <Paper style={{marginTop:'15px', backgroundColor:'white', padding:'2vw', marginBottom:'30px'}}>
                <Box style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div style={{fontWeight:'bold', fontSize:'1.5vw'}}>討論活動列表</div>
                    <Button variant="contained" color='secondary' style={{fontWeight:'bold'}}><Add sx={{mr:0.8}} fontSize="small" />新增討論活動</Button> 
                </Box>
                <Divider style={{marginTop:'15px', borderColor:'#707070'}}/>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                        <TableRow>
                            <TableCell style={{width:'38%', padding:0}}>討論活動名稱</TableCell>
                            <TableCell style={{width:'35%'}} align="center">討論日期</TableCell> 
                            <TableCell style={{width:'17%'}} align="right"> </TableCell>
                            <TableCell style={{width:'5%'}} align="center"> </TableCell>
                            <TableCell style={{width:'5%'}} align="center"> </TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => <Rows row={row} key={row.name} />)}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            </Box>
            <Snackbar open={alertName} autoHideDuration={6000} onClose={onCloseAlert}>
                <Alerts ref={ref} onClose={onCloseAlert} severity="error"sx={{width:'28vw'}}>
                    需先填寫討論活動名稱
                </Alerts>
            </Snackbar>
            <Modal
                open={addChildActOpen}
                onClose={() => setAddChildActOpen(false)}
            >
                <Box style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 260, backgroundColor: 'white', boxShadow: 24, padding:'20px 25px', borderRadius:'5px', display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <TextField style={{marginTop:'10px', width:'100%'}} InputLabelProps={{shrink:true,}} variant="standard" label="1. 活動名稱" color="warning" required value={childActName} onChange={(e) => setChildActName(e.target.value)} />
                    <Box sx={{mt:'30px', width:'100%'}}>
                        <p style={{color:'grey', fontSize:'4px', marginBottom:'10px'}}>2. 討論類型</p>
                        <Box style={{display:'flex', justifyContent:'space-around'}}>
                            <Box style={{fontSize:'4px', fontWeight:'bold'}}>
                                <Radio
                                    checked={radioValue === 'all'}
                                    onChange={(e) => setRadioValue(e.target.value)}
                                    value="all"
                                    name="child-types"
                                    sx={{ml:'-25px'}}
                                    color="default"
                                />
                                全體討論
                            </Box>
                            <Box style={{fontSize:'4px', fontWeight:'bold'}}>
                                <Radio
                                    checked={radioValue === 'group'}
                                    onChange={(e) => setRadioValue(e.target.value)}
                                    value="group"
                                    name="child-types"
                                    color="default"
                                /> 
                                分組討論
                            </Box>
                        </Box>
                        <Box style={{display:'flex', justifyContent:'flex-end', marginTop:'30px'}}>
                            <Button variant="contained" style={{fontWeight:'bold', marginLeft:'15px'}}>完成</Button> 
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </>
    );} else {
        return(<></>);
    }
}