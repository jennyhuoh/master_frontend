import { Box, IconButton, Paper, TextField, Button, Alert, Divider, Grid, Snackbar, Modal, Typography, Radio, TableRow, TableCell, TableContainer, Table, TableHead, TableBody } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowBackIosNew, AddCircleOutline, RemoveCircle, AddCircle } from '@mui/icons-material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import React,{ useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';
import { DndContext, closestCenter, DragOverlay, MeasuringStrategy, useSensors, useSensor, PointerSensor } from "@dnd-kit/core";
import { saveStagesSequence, createStage, createTeams, getAnActivity, deleteStage, getTeams, updateActivity } from '../features/api';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToHorizontalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers";
import { SortableItem } from "./sortableItem";
import { Item } from './item';
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Provider } from '../context';
import dayjs from 'dayjs';

const Alerts = React.forwardRef((props, ref) => {
    return <Alert elevation={6} ref={ref} {...props} />
})

export default function EditActivityContent(props) {
    let ref = React.createRef();
    let navigate = useNavigate();
    const [activityName, setActivityName] = useState('');
    const [startTime, setStartTime] = useState('');
    const [addChildActOpen, setAddChildActOpen] = useState(false);
    const [alertContent, setAlertContent] = useState();
    const [alertName, setAlertName] = useState(false);
    const [activeId, setActiveId] = useState(null);
    const [stages, setStages] = useState([]);
    const [showGrouping, setShowGrouping] = useState(false);
    const [container, setContainer] = useState({});
    const [childActName, setChildActName] = useState('');
    const [groupResultOpen, setGroupResultOpen] = useState(false);
    // const [displayAddForm, setDisplayAddForm] = useState(false);
    const [groupNum, setGroupNum] = useState(Math.floor(localStorage.getItem('usersNum')/3));
    const [radioValue, setRadioValue] = useState('all');
    const [groupModalOpen, setGroupModalOpen] = useState(false);
    const [groupItems, setGroupItems] = useState(JSON.parse(localStorage.getItem('usersInGroup')))
    const [activityDetail, setActivityDetail] = useState('');
    const [checkResult, setCheckResult] = useState(false);
    const [nowGroup, setNowGroup] = useState(null);
    const [successAlertOpen, setSuccessAlertOpen] = useState(false);

    const {mutate: mutateGetActivity} = useMutation(getAnActivity, {
        onSuccess: (data) => {
            console.log('activity detail', data)
            setActivityDetail(data);
        }
    })
    const { mutate: mutateSequence } = useMutation(saveStagesSequence, {
        onSuccess: (data) => {
            console.log('data', data)
        }
    })
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
    const {mutate: mutateTeams} = useMutation(createTeams, {
        onSuccess: () => {
            setGroupModalOpen(false)
            setGroupResultOpen(false)
            setAddChildActOpen(false)
            let newArr = [];
            async function ParseNumIdToString(groupItem) {
                await Promise.all(groupItem.map(async (item) => {
                    const data = await item
                    data.id = await data.id.toString()
                    newArr.push(data);
                }))
            }
            ParseNumIdToString(JSON.parse(localStorage.getItem('usersInGroup')));
            setGroupItems(newArr)
        }
    })
    const {mutate: mutateDelete} = useMutation(deleteStage, {
        onSuccess: () => {
            mutateGetActivity(props.activityId)
        }
    })
    const {mutate: mutateGetTeams} = useMutation(getTeams, {
        onSuccess: (data) => {
            console.log('team', data)
            setNowGroup(data)
        }
    })
    const {mutate: mutateUpdateActivity} = useMutation(updateActivity, {
        onSuccess: () => {
            setSuccessAlertOpen(true)
        }
    })
    useEffect(() => {
        if(successAlertOpen) {
            const timer = setTimeout(() => {
                navigate(`/group/${props.groupId}`);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [successAlertOpen])
    useEffect(() => {
        mutateGetActivity(props.activityId)
        let newArr = [];
        async function ParseNumIdToString(groupItem) {
            await Promise.all(groupItem.map(async (item) => {
                const data = await item
                data.id = await data.id.toString()
                newArr.push(data);
            }))
        }
        ParseNumIdToString(JSON.parse(localStorage.getItem('usersInGroup')));
        setGroupItems(newArr)
    }, [])
    const deleteAStage = (id) => {
        const result = stages.filter(stage => stage.id !== id);
        let s = result
        result.forEach((stage, index) => {
            s[index].order = index+1
        })
        setStages(s)
        mutateDelete(id);
    }
    const getTeamsBtn = (id) => {
        mutateGetTeams(id)
        setCheckResult(true)
    }
    const contextValue = {deleteAStage, getTeamsBtn};

    useEffect(() => {
        if(activityDetail) {
            setActivityName(activityDetail.activityName)
            const startT = activityDetail.activityStartDate
            const month = startT.substr(0, 2)
            const day = startT.substr(5, 2)
            const year = startT.substr(11, 4)
            const time = startT.substr(19, 5)
            let ap = startT.substr(25, 2);
            setStartTime(new Date(month+'-'+day+'-'+year+" "+time+" "+ap).getTime())
            // console.log('startTime', startTime)
            // console.log('startTime', month+'-'+day+'-'+year+" "+time+" "+ap)
            let s = activityDetail.stagesForActivity
            activityDetail.stagesForActivity.forEach((stage, index) => {
                s[index].order = index+1
            })
            setStages(s)
        }
    }, [activityDetail])

    const onClickAddChildAct = () => {
        if(activityName!=='') {
            setAddChildActOpen(true);
            setGroupNum(Math.floor(localStorage.getItem('usersNum')/3))
            console.log('group num', groupNum);
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
    const measuringConfig = {
        droppable: {
            strategy: MeasuringStrategy.Always,
        }
    }
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint:{
                distance: 8,
            }
        })
    )
    function GroupingAction() {
        useEffect(() => {
            console.log('container', container)
        }, [container])
        console.log('from localStorage', localStorage.getItem('usersInGroup'))
        console.log('groupItems', groupItems);
        // const taskStatus = container;
        // const [columns, setColumns] = useState(taskStatus);

        const onDragEnd = (result, container, setContainer) => {
            if (!result.destination) return;
            const { source, destination } = result;
          
            if (source.droppableId !== destination.droppableId) {
              const sourceColumn = container[source.droppableId];
              const destColumn = container[destination.droppableId];
              const sourceItems = [...sourceColumn.items];
              const destItems = [...destColumn.items];
              const [removed] = sourceItems.splice(source.index, 1);
              destItems.splice(destination.index, 0, removed);
              setContainer({
                ...container,
                [source.droppableId]: {
                  ...sourceColumn,
                  items: sourceItems
                },
                [destination.droppableId]: {
                  ...destColumn,
                  items: destItems
                }
                });
            } else {
                const column = container[source.droppableId];
                const copiedItems = [...column.items];
                const [removed] = copiedItems.splice(source.index, 1);
                copiedItems.splice(destination.index, 0, removed);
                setContainer({
                  ...container,
                  [source.droppableId]: {
                    ...column,
                    items: copiedItems
                  }
                });
            }
        };
        const onClickFinishGrouping = () => {
            if(container['main'].items.length === 0) {
                const stage = {
                    stageName: childActName,
                    grouping: true,
                    stageOrder: stages.length+1
                }
                mutate(stage);
                setChildActName('');
                setGroupResultOpen(true);
                console.log('stages', stages)
            } else {
                setAlertContent('組員尚未分配完成')
                setAlertName(true);
            } 
        }
        
          return (
            <div>
              <div
                style={{ display: "flex", height: "100%", marginTop:'20px', backgroundColor:'#EEF1F4', overflowX:'scroll' }}
              >
                <DragDropContext
                  onDragEnd={(result) => onDragEnd(result, container, setContainer)}
                >
                  {Object.entries(container).map(([columnId, column], index) => {
                    return (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                        key={columnId}
                      >
                        {column.name !== 'main' ?
                        <div style={{backgroundColor:'#5A81A8', width:150, height: 50, padding: 4, display:'flex', justifyContent:'center', alignItems:'center', fontSize:'18px', fontWeight:'semi-bold', color:'white', letterSpacing:'1px', marginTop: 8}}>{column.name}</div>
                        : <div style={{width:150, height: 50, padding: 4, marginTop: 8, fontSize:'18px', fontWeight:'bold'}}>
                            <div style={{backgroundColor:'#2B3143', color:'white', width:100, height: 34, display:'flex', justifyContent:'center', alignItems:'center'}}>
                                分組
                            </div>
                          </div>
                        }
                        <div style={{ margin:'2px 10px 10px 10px' }}>
                          <Droppable droppableId={columnId} key={columnId}>
                            {(provided, snapshot) => {
                              return (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  style={{
                                    background: snapshot.isDraggingOver
                                      ? "rgba(246, 189, 88, 0.5)"
                                      : "#5A81A8",
                                    padding: 4,
                                    width: 150,
                                    minHeight: 440
                                  }}
                                >
                                  {column.items.map((item, index) => {
                                    return (
                                      <Draggable
                                        key={item.id}
                                        draggableId={item.id}
                                        index={index}
                                      >
                                        {(provided, snapshot) => {
                                          return (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              style={{
                                                userSelect: "none",
                                                padding: 16,
                                                margin: "0 0 8px 0",
                                                minHeight: "30px",
                                                minWidth: "50px",
                                                backgroundColor: snapshot.isDragging
                                                  ? "lightgray"
                                                  : "#EEF1F4",
                                                color: "black",
                                                display:'flex',
                                                justifyContent:'center',
                                                alignItems:'center',
                                                fontSize:'18px',
                                                ...provided.draggableProps.style
                                              }}
                                            >
                                              {item.label}
                                            </div>
                                          );
                                        }}
                                      </Draggable>
                                    );
                                  })}
                                  {provided.placeholder}
                                </div>
                              );
                            }}
                          </Droppable>
                        </div>
                      </div>
                    );
                  })}
                </DragDropContext>
                <Box style={{display:'flex', height:'40px', alignSelf:'end', justifySelf:'flex-end', right:'6vw', position:'absolute', backgroundColor:'#EEF1F4', zIndex:1200}}>
                    <Button href="#activity" onClick={() => setShowGrouping(false)} variant="contained" color='secondary' style={{fontWeight:'bold'}}>取消</Button> 
                    <Button onClick={onClickFinishGrouping} variant="contained" style={{fontWeight:'bold', marginLeft:'15px'}}>儲存分組</Button> 
                </Box>
              </div>
            </div>
          );
    }
    const finishAddForm = () => {
        const data = {
            activityName: activityName,
            activityStartDate: `${startTime}`,
            stageId: stages
        }
        console.log('data', data)
        // 這裡要改成edit activity
        mutateUpdateActivity({
            id: props.activityId,
            info: data
        })
    }
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
    const onChangeRadio = (e) => {
        setGroupNum(Math.floor(localStorage.getItem('usersNum')/3))
        setRadioValue(e.target.value)
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
            mutate(stage);
            setAddChildActOpen(false);
            setChildActName('');
        }
    }
    function ChildModal() {
        const onClickMinus = () => {
            if(groupNum >= 2){
                setGroupNum(groupNum-1)
            }
        }
        const onClickAdd = () => {
            if(groupNum < Math.floor(localStorage.getItem('usersNum')/2) && groupNum < 8) {
                setGroupNum(groupNum+1)
            }
            
        }
        const onClickGroupNum = () => {
            let obj = {};
            console.log('groupItems', groupItems)
            obj.main = {
                name: "main",
                items: groupItems.main ? groupItems.main : groupItems
            }
            for(let i = 1; i <= groupNum; i++) {
                const a = 'container'+i;
                obj['container'+i] = {
                 name: '組別'+i,
                 items: []   
                }
            }
            console.log('obj', obj)
            setContainer(obj)
            setAddChildActOpen(false)
            setGroupModalOpen(false)
            setShowGrouping(true)
        }
        return(
            <React.Fragment>
                <Modal
                    open={groupModalOpen}
                >
                    <Box style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 260, backgroundColor: 'white', boxShadow: 24, padding:'30px 25px', borderRadius:'5px', display:'flex', flexDirection:'column', alignItems:'center'}}>
                        <Box style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
                            <Typography style={{fontWeight:'bold', fontSize:'18px', marginBottom:'10px'}}>學生人數 {localStorage.getItem('usersNum')} 人</Typography>
                            {/* <Typography sx={{fontWeight:'bold', alignSelf:'center'}}>分組樣板 :</Typography> */}
                            <Box style={{display:'flex', alignItems:'center', marginBottom:'10px'}}><Typography style={{fontSize:'18px'}}>組數: </Typography><IconButton style={{color:'#2B3143'}} onClick={onClickMinus}><RemoveCircle /></IconButton>{groupNum}<IconButton style={{color:'#2B3143'}} onClick={onClickAdd}><AddCircle /></IconButton></Box>
                        </Box>
                        <Box style={{display:'flex', marginTop:'10px', width:'100%', justifyContent:'space-between'}}>
                            <Button onClick={() => setGroupModalOpen(false)} variant="contained" color='secondary' style={{fontWeight:'bold'}}>返回</Button> 
                            <Button href="#group" onClick={onClickGroupNum} variant="contained" style={{fontWeight:'bold', marginLeft:'15px'}}>下一步</Button> 
                        </Box>
                    </Box>
                </Modal>
            </React.Fragment>
        );
        
    }
    const onCloseResultModal = async () => {
        setShowGrouping(false)
        var teams = []
        console.log('stages', stages)
        let stageId = stages[stages.length-1].id;
        console.log('stageid', stageId)
        await Promise.all(Object.keys(container).map((key, index) => {
            if(key !== 'main') {
                const team = {
                    teamName: container[key].name,
                    teamOrder: index,
                    teamMembers: container[key].items
                }
                teams.push(team);
            }
        }))
        console.log('teams', teams)
        mutateTeams({
            teams: teams,
            id: stageId
        })
    } 
    const GroupResult = (props) => {
        return(
            <TableRow
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
                <TableCell style={{width:'20%', verticalAlign:'baseline'}} component="th" scope="row">
                    {props.groupName}
                </TableCell>
                <TableCell style={{width:'80%', verticalAlign:'baseline', display:'flex'}}>
                    {props.members.map((member) => {
                        return <div key={member.id} style={{padding:'7px 2px', margin:'2px', display:'flex', border:'2px solid black', borderRadius:'5px', width:'60px',justifyContent:'center', alignItems:'center', fontWeight:'bold'}}>{member.label}</div>
                    })}
                </TableCell>
            </TableRow> 
        );
    }
    function ResultModal() {
        return(
            <React.Fragment>
            <Modal
                open={groupResultOpen}
                onClose={onCloseResultModal}
            >
                <Box style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, backgroundColor: 'white', boxShadow: 24, padding:'20px 25px', borderRadius:'5px', display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                            <TableRow>
                                <TableCell style={{width:'20%', padding:0}}>小組</TableCell>
                                <TableCell style={{width:'80%'}}>成員</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.keys(container).map((key, index) => {
                                    if(key !== 'main'){
                                        return(
                                        <GroupResult key={key} groupName={container[key].name} members={container[key].items} />
                                        )
                                    }
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box style={{display:'flex', marginLeft:'670px', marginTop:'10px'}}>
                        <Button href="#activity" variant="contained" color='secondary' style={{fontWeight:'bold'}} onClick={onCloseResultModal}>完成</Button> 
                    </Box>
                </Box>
            </Modal>
        </React.Fragment> 
        );
    }

    return(
        <Provider value={contextValue}>
        <Box style={{padding:'12vh 40px'}}>
            <IconButton style={{color:'black', marginBottom:'5px'}} component={Link} to={`/group/${props.groupId}`}><ArrowBackIosNew sx={{fontSize:'1.5vw'}} /></IconButton><span style={{fontWeight:'bold', fontSize:'20px', marginLeft:'10px'}}>{activityName} 編輯</span>    
            <Box>
                <Paper elevation={3} style={{marginTop:'35px', backgroundColor:'white', padding:'2vw', marginBottom:'30px', borderRadius:'10px'}}>
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
                                minDate={dayjs()}
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>
                    <p style={{color:'grey', fontSize:'4px', margin:'30px 0', padding:'0 20px'}}>3.活動規劃</p>
                    <Box style={{display:'flex', padding:'0 20px'}} id="group">
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
                    {showGrouping ? <GroupingAction />:
                    <Grid container spacing={20} style={{padding:'0 20px'}}>
                        <Grid item xs={12} sx={{marginTop:'50px', display:'flex', justifyContent:'flex-end'}}>
                            <Button variant="contained" style={{fontWeight:'bold', marginLeft:'15px'}} onClick={finishAddForm}>完成</Button>
                        </Grid>
                    </Grid>
                    }
                    
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
            <ResultModal />
            <Modal
                open={checkResult}
                onClose={() => {
                    setCheckResult(false)
                    setNowGroup(null)
                }}
            >
                <Box style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, backgroundColor: 'white', boxShadow: 24, padding:'20px 25px', borderRadius:'5px', display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                            <TableRow>
                                <TableCell style={{width:'20%', padding:0}}>小組</TableCell>
                                <TableCell style={{width:'80%'}}>成員</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                                {nowGroup && nowGroup.map((group) => {
                                    return(
                                        <GroupResult key={group.id} groupName={group.teamName} members={group.teamMembers} />
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Button variant="contained" color='secondary' style={{fontWeight:'bold', marginLeft:'710px', marginBottom:'10px'}} onClick={() => {
                        setCheckResult(false)
                        setNowGroup(null)    
                    }}>完成</Button> 
                </Box>
            </Modal>
            <Snackbar open={successAlertOpen} autoHideDuration={6000} onClose={onCloseAlert}>
                <Alerts ref={ref} onClose={onCloseAlert} severity="success"sx={{width:'28vw'}}>
                儲存成功!
                </Alerts>
            </Snackbar>
        </Box>
        </Provider>
    );
}