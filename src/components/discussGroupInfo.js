import { TextField, Box, Grid, Button, Paper, IconButton } from "@mui/material";
import Select from 'react-select';
import { ArrowBackIosNew } from "@mui/icons-material";
import { useState, useEffect } from 'react';
import { DatePicker, LocalizationProvider, } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

export default function DiscussGroupInfo() {
    const options= [
        {value: 'person1', label: 'person1'},
        {value: 'person2', label: 'person2'},
        {value: 'person3', label: 'person3'},
    ]
    let options2= [
        {value: 'person1', label: 'person1'},
        {value: 'person2', label: 'person2'},
        {value: 'person3', label: 'person3'},
        {value: 'person4', label: 'person4'},
        {value: 'person5', label: 'person5'},
    ]
    const [selected, setSelected] = useState([options[0]]);
    const [groupEndTime, setGroupEndTime] = useState(dayjs().add(1, 'year').format('YYYY/MM/DD'));
    const [members, setMembers] = useState(options2);
    const [selectedMembers, setSelectedMembers] = useState('');
    
    useEffect(() => {
        console.log(selected)
        selected.map((option) => {
            options2 = options2.filter((option2) => option2.value!== option.value)
        })
        console.log(options2)
        setMembers(options2)
    }, [selected])

    // 是否為管理者
    if(true) {
        return(
            <Box m={'3vw 3vw 2vw 3vw'}>
                <IconButton style={{color:'black', marginBottom:'5px'}} component={Link} to='/home'><ArrowBackIosNew sx={{fontSize:'1.5vw'}} /></IconButton><span style={{fontWeight:'bold', fontSize:'2vw', marginLeft:'10px'}}>群組名稱在這裡</span>
                {/* 群組資訊 */}
                <Paper style={{marginTop:'15px', backgroundColor:'white', padding:'2vw'}}>
                    <Grid container spacing={20} style={{padding:'0 20px'}}>
                        <Grid item xs={6}>
                            <TextField style={{width:'35vw', marginTop:'10px'}} InputLabelProps={{shrink:true,}} variant="standard" label="群組名稱" color="warning" />
                        </Grid>
                        <Grid item xs={6}>
                            <p style={{color:'grey', fontSize:'0.2vw'}}>管理者</p>
                            <Select
                             options={options}
                             defaultValue={options[0]}
                             isMulti    
                             onChange={(values) => setSelected(values)}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={20} style={{padding:'50px 20px 25px 20px'}}>
                        <Grid item xs={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                label='群組結束日期'
                                value={groupEndTime}
                                onChange={(value) => setGroupEndTime(value)}
                                renderInput={(params) => <TextField {...params} style={{marginTop:'10px'}} InputLabelProps={{ shrink: true }} variant="standard" />}
                                inputFormat='YYYY/MM/DD'
                                defaultValue={groupEndTime}
                                minDate={dayjs().add(1, 'day')}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={6}>
                            <p style={{color:'grey', fontSize:'0.2vw'}}>參與討論成員</p>
                            <Select
                             options={members}
                             isMulti    
                             onChange={(values) => setSelectedMembers(values)}
                            />
                        </Grid>
                    </Grid>
                    <Box style={{display:'flex', justifyContent:'flex-end', paddingRight:'20px'}}>
                        <Button variant="outlined" color='error'>刪除</Button>
                        <Button variant="contained" color='primary' style={{marginLeft:'20px'}}>儲存更改</Button>
                    </Box>
                </Paper>
            </Box>
        );
    } else {
        return(
            <Box></Box>
        );
    }
    
}