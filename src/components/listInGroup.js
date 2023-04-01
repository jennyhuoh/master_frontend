import { Box, Divider, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button, Grid, TextField, Typography, Alert, Snackbar, Modal, Radio, IconButton } from "@mui/material";
import React,{ useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { v4 as uuid } from 'uuid';
import { Add, AddCircleOutline, AddCircle, RemoveCircle } from '@mui/icons-material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DndContext, closestCenter, DragOverlay, MeasuringStrategy, useDraggable, useSensors, useSensor, PointerSensor, closestCorners } from "@dnd-kit/core";
import { arrayMove, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./sortableItem";
import { useMutation } from 'react-query';
import { createStage, saveStagesSequence } from "../features/api";
import { Item } from './item';
import { Provider } from '../context';
import { restrictToHorizontalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers";
import { GroupItem } from './groupSortableItem';
import dayjs from 'dayjs';
import Container from './container';


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

const measuringConfig = {
    droppable: {
        strategy: MeasuringStrategy.Always,
    }
}

export default function ListInGroup(appProps) {
    // console.log(appProps.groupId)
    const [displayAddForm, setDisplayAddForm] = useState(false);
    const [startTime, setStartTime] = useState();
    const [activityName, setActivityName] = useState('');
    const [addChildActOpen, setAddChildActOpen] = useState(false);
    const [alertName, setAlertName] = useState(false);
    const [childActName, setChildActName] = useState('');
    const [radioValue, setRadioValue] = useState('all');
    const [alertContent, setAlertContent] = useState('請先填寫討論活動名稱以及開始時間');
    // const [stages, setStages ] = useState([{id:1, stageName:"任務說明", order:1, grouping:false}, {id:2, stageName:"小組報告", order:2, grouping:false}]);    
    const [stages, setStages] = useState([])
    const [activeId, setActiveId] = useState(null);
    const [groupModalOpen, setGroupModalOpen] = useState(false);
    const [groupNum, setGroupNum] = useState(Math.floor(localStorage.getItem('usersNum')/3));
    const [groupItems, setGroupItems] = useState({
        main: JSON.parse(localStorage.getItem('usersInGroup')), 
    })
    const [flag, setFlag] = useState(true);
    const [groupResultOpen, setGroupResultOpen] = useState(false);
    let ref = React.createRef();
    
    useEffect(() => {
        setFlag(false)
        setGroupItems({main: JSON.parse(localStorage.getItem('usersInGroup')),})
    }, [groupNum])

    useEffect(() => {
        if(flag === false) {
            for(let i = 1; i <= groupNum; i++) {
                const a = 'container'+i;
                groupItems[a] = []
                setGroupItems({...groupItems})
                setFlag(true)
            } 
        }
    }, [flag])

    useEffect(() => {
        for(let i = 1; i <= groupNum; i++) {
            const a = 'container'+i;
            groupItems[a] = []
            setGroupItems({...groupItems})
        }
    }, [])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint:{
                distance: 8,
            }
        })
    )
    const sensorsChild = useSensors(
        useSensor(PointerSensor)
    )
    const { mutate } = useMutation(createStage, {
        onSuccess: (data) => {
            console.log('dd', data)
            const stage = {
                id: data.id,
                stageName: data.stageName,
                order: data.stageOrder,
                grouping: data.grouping
            }
            const d = stages.push(stage);
            console.log('d', d);
            console.log(stages)
        }
    })
    const { mutate: mutateSequence } = useMutation(saveStagesSequence, {
        onSuccess: (data) => {
            console.log('data', data)
        }
    })
    

    useEffect(() => {
        if(childActName === '' && radioValue === 'group' ) {
            setRadioValue('all')
            setAlertContent('請先填寫活動名稱')
            setAlertName(true)
        } else if(childActName !== '' && radioValue === 'group') {
            setGroupModalOpen(true)
            setRadioValue('all')
        }
    }, [radioValue])

    const onClickAddChildAct = () => {
        if(activityName!=='') {
            setAddChildActOpen(true);
        } else {
            setAlertContent('請先填寫討論活動名稱以及開始時間')
            setAlertName(true);
        }
    }

    const onCloseAlert = (event, reason) => {
        if(reason === 'clickaway') {
            return;
        }
        setAlertName(false);
    }

    const onClickFinishStage = () => {
        if(childActName === '') {
            setAlertContent('請先填寫活動名稱')
            setAlertName(true)
        } else {
            const stage = {
                stageName: childActName,
                grouping: (radioValue === 'all') ? false : true,
                stageOrder: stages.length+1
            }
            // console.log('stage', stage);
            mutate(stage);
            setAddChildActOpen(false);
            setChildActName('');
        }
    }

    const deleteAStage = (id) => {
        const result = stages.filter(stage => stage.id !== id);
        setStages(result);
        // console.log('deleted', result);
    }
    const contextValue = {deleteAStage};

    function handleDragEnd(event) {
        // console.log("Drag end called");
        const {active, over} = event;
        console.log("ACTIVE: " + active.id);
        console.log("OVER :" + over.id);
        
        if(active.id !== over.id) {
            const activeIndex = stages.findIndex(i => i.id === active.id);
            const overIndex = stages.findIndex(i => i.id === over.id);
            const a =  arrayMove(stages, activeIndex, overIndex);
            for(let i = 0; i < a.length; i++) {
                a[i].order = i+1
            }
            console.log('a', a)
            // console.log(arrayMove(stages, activeIndex, overIndex));
            setStages(a)
            mutateSequence(stages);
        }
        setActiveId(null);
    }
    
    function handleDragStart(event) {
        console.log('start drag')
        const{active} = event;
        console.log("ACTIVE: " + active.id);
        setActiveId(active.id);
    }

    function handleDragOver(event) {
        console.log('start drag over')
        const { active, over, draggingRect } = event;
        const { id } = active;
        const { id: overId } = over
        console.log('active', id);
        console.log('over', overId)
        // Find the containers
        var activeContainer;
        var overContainer;
        findContainer(id)
        .then(async (data) => {
            activeContainer = await data
            await findContainer(overId)
            .then(async (d) => {
                overContainer = await d
            })
        })
        .then(() => {
            console.log('activeContainer', activeContainer)
            console.log('overContainer', overContainer);
            if(!activeContainer || !overContainer || activeContainer === overContainer) {
                // console.log('i am here')
                return;
            }
    
            setGroupItems((prev) => {
                const activeItems = prev[activeContainer];
                const overItems = prev[overContainer];
                
                // Find the indexes of the items
                const activeIndex = activeItems.findIndex(i => i.id === id);
                const overIndex = overItems.findIndex(i => i.id === overId);
                console.log('aIndex', activeIndex)
                console.log('oIndex', overIndex)
                let newIndex;
                if(overId === Object.keys(prev).find((item) => item === overId)) {
                    newIndex = overItems.length + 1;
                } else {
                    newIndex = overIndex >= 0 ? overIndex + 1 : overItems.length + 1;
                }
                
                return {
                    ...prev,
                    [activeContainer]: [
                        ...prev[activeContainer].filter((item) => item.id !== active.id)
                    ],
                    [overContainer]: [
                        ...prev[overContainer].slice(0, newIndex),
                        groupItems[activeContainer][activeIndex],
                        ...prev[overContainer].slice(newIndex, prev[overContainer].length)
                    ]
                }
            })
        })
       
    }

    async function findContainer(id) {
        var result = 0;
        if(typeof(id) !== 'number'){
            return id
        }
        await Promise.all(Object.entries(groupItems).map(([key, value]) => {
            console.log('value', value)
            if(value.length !== 0) {
                if(value?.find(e => e?.id === id)){
                    console.log('here', key)
                    result = key;
                }
            }
        }))
        return result;
    }

    function handleDragEndChild(event) {
        console.log('start logging end')
        console.log('groupItems', groupItems)
        const {active, over} = event;
        const {id} = active;
        const {id:overId} = over;

        var activeContainer;
        var overContainer;
        findContainer(id)
        .then(async (data) => {
            activeContainer = await data
            await findContainer(overId)
            .then(async (d) => {
                overContainer = await d
            })
        })
        .then(() => {
            if(!activeContainer || !overContainer || activeContainer !== overContainer){
                return;
            }
            const activeIndex = groupItems[activeContainer].findIndex(i => i.id === active.id);
            const overIndex = groupItems[overContainer].findIndex(i => i.id === overId);

            if(activeIndex !== overIndex){
                setGroupItems((groupItems) => ({
                    ...groupItems,
                    [overContainer]: arrayMove(groupItems[overContainer], activeIndex, overIndex)
                }))
            }
            setActiveId(null);
        })
    }

    const onClickSaveGroup = () => {
        if(groupItems['main'].length === 0) {
            const stage = {
                stageName: childActName,
                grouping: true,
                stageOrder: stages.length+1
            }
            // console.log('stage', stage);
            mutate(stage);
            // setAddChildActOpen(false);
            setChildActName('');
            setGroupResultOpen(true);
        } else {
            setAlertContent('組員尚未分配完成')
            setAlertName(true);
        }
    }

    function ChildModal() {
        const onClickMinus = () => {
            if(groupNum > 2){
                setGroupNum(groupNum-1)
            }
        }
        const onClickAdd = () => {
            if(groupNum < Math.floor(localStorage.getItem('usersNum')/2) && groupNum < 8) {
                setGroupNum(groupNum+1)
            }
            console.log(groupItems)
        }
        const containerStyle = {
            background: "#5A81A8",
            // padding: 5,
            margin: 10,
            minHeight: '65px',
            display: 'flex',
            borderRadius: '3px',
            flexWrap:'wrap'
          };
          
          const containerStyle2 = {
              background: "#EEF1F4",
              padding: '10 10 10 0',
              margin: 10,
              minHeight: '120px',
              display: 'flex',
              borderRadius: '2px',
              flexWrap:'wrap'
            };
        return(
            <React.Fragment>
                <Modal
                    open={groupModalOpen}
                    // onClose={() => setGroupModalOpen(false)}
                >
                    <Box style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, backgroundColor: 'white', boxShadow: 24, padding:'20px 25px', borderRadius:'5px', display:'flex', flexDirection:'column', alignItems:'center'}}>
                        <Box style={{display:'flex'}}>
                            {/* <Typography sx={{fontWeight:'bold', alignSelf:'center'}}>分組樣板 :</Typography> */}
                            <Box style={{display:'flex', marginLeft:'550px', alignItems:'center'}}><Typography>學生人數 {localStorage.getItem('usersNum')} 人，組數: </Typography><IconButton style={{color:'#2B3143'}} onClick={onClickMinus}><RemoveCircle /></IconButton>{groupNum}<IconButton style={{color:'#2B3143'}} onClick={onClickAdd}><AddCircle /></IconButton></Box>
                        </Box>
                        <DndContext
                            sensors={sensorsChild}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEndChild}
                        >
                            <Grid container>
                                <Grid item xs={6}>
                                {Object.keys(groupItems).map((key, index) => {
                                    if(key !== 'main'){
                                        return(
                                            <Grid container key={key} style={{display:'flex'}}>
                                                <Grid item xs={2} style={{background: "#5A81A8", marginTop: 10, height: '65px', display: 'flex', borderRadius: '3px', justifyContent:'center', alignItems:'center', color:'white', padding:5}}>{index}</Grid>
                                                <Grid item xs={10}>
                                                <Container style={containerStyle} key={key} id={key} items={groupItems[key]} />
                                                </Grid>
                                            </Grid>
                                        )
                                    }
                                })}
                                </Grid>
                                <Grid item xs={6}>
                                    <Container style={containerStyle2} id="main" items={groupItems["main"]} />
                                </Grid>
                            </Grid>
                            {/* <DragOverlay>{activeId ? <GroupItem id={activeId} /> : null}</DragOverlay> */}
                        </DndContext>
                        <Box style={{display:'flex', marginLeft:'620px', marginTop:'10px'}}>
                            <Button onClick={() => setGroupModalOpen(false)} variant="contained" color='secondary' style={{fontWeight:'bold'}}>取消</Button> 
                            <Button onClick={onClickSaveGroup} variant="contained" style={{fontWeight:'bold', marginLeft:'15px'}}>儲存分組</Button> 
                        </Box>
                        <ResultModal />
                    </Box>
                </Modal>
            </React.Fragment>
        );
    }
    const onCloseResultModal = () => {
        setGroupModalOpen(false)
        setGroupResultOpen(false)
        setAddChildActOpen(false)
    } 
    function ResultModal() {
        return(
            <React.Fragment>
            <Modal
                open={groupResultOpen}
                onClose={onCloseResultModal}
            >
                <Box style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, backgroundColor: 'white', boxShadow: 24, padding:'20px 25px', borderRadius:'5px', display:'flex', flexDirection:'column', alignItems:'center'}}>
                 
                    <Box style={{display:'flex', marginLeft:'620px', marginTop:'10px'}}>
                        <Button variant="contained" color='secondary' style={{fontWeight:'bold'}}>取消</Button> 
                        <Button variant="contained" style={{fontWeight:'bold', marginLeft:'15px'}}>儲存分組</Button> 
                    </Box>
                </Box>
            </Modal>
        </React.Fragment> 
        );
    }
    const onChangeRadio = (e) => {
        setGroupNum(Math.floor(localStorage.getItem('usersNum')/3))
        setRadioValue(e.target.value)
    }
    if(true){
    return(
        <Provider value={contextValue}>
            {displayAddForm && (
                <Box m={'2vw 3vw 2vw 3vw'}>
                    <Paper style={{marginTop:'15px', backgroundColor:'white', padding:'2vw', marginBottom:'30px', borderRadius:'10px'}}>
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
                        <p style={{color:'grey', fontSize:'4px', margin:'30px 0', padding:'0 20px'}}>3.活動規劃</p>
                        <Box style={{display:'flex', padding:'0 20px'}}>
                            <Button variant="contained" color="secondary" style={{width: '200px', height: '120px', borderRadius:'5px', display:'flex',flexDirection:'column', justifyContent:'center', alignItems:'center', border:'1.5px #BEBEBE dashed', marginRight:'15px'}} onClick={onClickAddChildAct}>
                                <AddCircleOutline color="disabled" style={{fontSize:'55px', marginBottom:'8px'}} />
                                <Typography color="gray" sx={{fontSize:'4px'}}>新增活動</Typography>
                            </Button>
                            <DndContext
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                                onDragStart={handleDragStart}
                                measuring={measuringConfig}
                                sensors={sensors}
                                modifiers={[restrictToHorizontalAxis]}
                            >
                                <div className="p-3" style={{"width": "100%", display:'flex', flexDirection:'row',overflowX:'scroll'}} align="center">
                                    <SortableContext
                                        items={stages}
                                        strategy={horizontalListSortingStrategy}
                                    > 
                                        {/* We need components that use the useSortable hook */}
                                    {stages.map(stage => <SortableItem key={stage.id} id={stage.id} name={stage.stageName} order={stage.order} grouping={stage.grouping.toString()} activeid={(activeId == stage.id).toString()}/>)}
                                    </SortableContext>
                                    <DragOverlay modifiers={[restrictToWindowEdges]}>
                                    {activeId ? <Item id={activeId} /> : null}
                                    </DragOverlay>
                                </div>
                            </DndContext>
                        </Box>
                        <Grid container spacing={20} style={{padding:'0 20px'}}>
                            <Grid item xs={12} sx={{marginTop:'50px', display:'flex', justifyContent:'flex-end'}}>
                                <Button onClick={() => setDisplayAddForm(false)} variant="contained" color='secondary' style={{fontWeight:'bold'}}>取消</Button> 
                                <Button variant="contained" style={{fontWeight:'bold', marginLeft:'15px'}}>完成</Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>
            )}
            <Box m={'2vw 3vw 2vw 3vw'}>
            <Paper style={{marginTop:'15px', backgroundColor:'white', padding:'2vw', marginBottom:'30px', borderRadius:'10px'}}>
                <Box style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div style={{fontWeight:'bold', fontSize:'1.5vw'}}>討論活動列表</div>
                    <Button variant="contained" color='secondary' style={{fontWeight:'bold'}} onClick={() => setDisplayAddForm(true)}><Add sx={{mr:0.8}} fontSize="small" />新增討論活動</Button> 
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
                    {alertContent} 
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
                                    onChange={(e) => onChangeRadio(e)}
                                    value="group"
                                    name="child-types"
                                    color="default"
                                /> 
                                分組討論
                            </Box>
                        </Box>
                        <Box style={{display:'flex', justifyContent:'flex-end', marginTop:'30px'}}>
                            <Button variant="contained" style={{fontWeight:'bold', marginLeft:'15px'}} onClick={onClickFinishStage}>完成</Button> 
                        </Box>
                    </Box>
                    <ChildModal />
                </Box>
            </Modal>
        </Provider>
    );} else {
        return(<></>);
    }
}

