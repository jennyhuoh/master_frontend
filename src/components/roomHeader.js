import { Box, Typography, IconButton, Toolbar, AppBar, Drawer, Divider, Stack, Alert, Button, Modal, TextField, Radio, Snackbar } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { Menu, ChevronLeft, ChevronRight } from "@mui/icons-material";
import React, { useState, useEffect } from 'react';
import { getGroupInfo, getAnActivity, editStage, saveStagesSequence, createStage, createTeams, updateActivity } from '../features/api';
import { useQuery, useMutation } from 'react-query';
import { Provider } from '../context';
import MainRoomContent from "../components/mainRoomContent";
import { DndContext, MeasuringStrategy, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { RoomSortableItem } from "./roomSortableItem";

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
      flexGrow: 1,
      marginTop: '100px',
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: `-${drawerWidth}px`,
      ...(open && {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
      }),
    }),
);

const AppBars = styled(AppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
  })(({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end"
}));
const Alerts = React.forwardRef((props, ref) => {
    return <Alert elevation={6} ref={ref} {...props} />
})
export default function RoomHeader(props) {
    const theme = useTheme();
    const [openDrawer, setOpenDrawer] = useState(false);
    const groupId = props.groupId;
    const roomID = props.activityId;
    const [groupInfo, setGroupInfo] = useState(undefined);
    const [activityInfo, setActivityInfo] = useState(undefined);
    const [stageInfo, setStageInfo] = useState([]);
    const [isOwner, setIsOwner] = useState(false);
    const [checkingStage, setCheckingStage] = useState(undefined);
    const [activeId, setActiveId] = useState(null);
    const [addStageOpen, setAddStageOpen] = useState(false);
    const [newStageName, setNewStageName] = useState('');
    const [radioValue, setRadioValue] = useState('all');
    const [alertOpen, setAlertOpen] = useState(false);
    const [mutateTeamsDetail, setMutateTeamsDetail] = useState(null);
    let ref = React.createRef();
    const {data:groupData} = useQuery(['group', groupId], () =>
    getGroupInfo(groupId), {
        onSuccess: async() => {
            setGroupInfo(groupData)
        }
    })
    useEffect(() => {
        console.log('stageInfo', stageInfo)
    }, [stageInfo])
    const {mutate} = useMutation(getAnActivity, {
        onSuccess: async(data) => {
            console.log('data', data)
            setActivityInfo(data)
            setStageInfo(data?.stagesForActivity)
        }
    })
    const {mutate:stageMutate} = useMutation(editStage, {
        onSuccess: async (data) => {
            console.log('stageMutate data', data)
            setCheckingStage(data)
            mutate(roomID)
        }
    })
    const {mutate: mutateSequence} = useMutation(saveStagesSequence, {
        onSuccess: (data) => {
            console.log('mutated sequence', data)
        }
    })
    const {mutate: mutateCreateStage} = useMutation(createStage, {
        onSuccess: (data) => {
            console.log('successfully created a stage data:', data);
            mutateUpdateActivity({
                id: roomID,
                info: {
                    stageId: [data.id]
                }
            })
            if(mutateTeamsDetail !== null) {
                mutateTeams({
                    teams: mutateTeamsDetail,
                    id: data.id
                })
            }
        }
    })
    const {mutate: mutateTeams} = useMutation(createTeams, {
        onSuccess: () => {
            mutate(roomID) 
            setRadioValue('all')
        }
    })
    const {mutate: mutateUpdateActivity} = useMutation(updateActivity, {
        onSuccess: (data) => {
            console.log('make association between acitvity and stage:', data)
            mutate(roomID)
        }
    })

    const editStageFunc = (id, checked) => {
        stageMutate({
            id: id,
            stage: {
                stageChecked: checked
            }
        })
    }
    const contextValue = {editStageFunc, stageInfo, checkingStage, openDrawer};

    useEffect(() => {
        if(groupInfo !== undefined) {
            if(groupInfo?.owner.id.toString() === localStorage.getItem('userId')){
                setIsOwner(true)
            }
        }
    }, [groupInfo])

    useEffect(() => {
        setGroupInfo(groupData)
    }, [groupData])

    useEffect(() => {
        if(localStorage.getItem('discussType') === 'all') {
            mutate(roomID)
        }
    }, [localStorage.getItem('discussType')])

    const handleDrawerOpen = () => {
        setOpenDrawer(true);
      };
    
    const handleDrawerClose = () => {
        setOpenDrawer(false);
    };
    function handleDragEnd(event) {
        const {active, over} = event;
        console.log('ACTIVE: ' + active.id);
        console.log('OVER: ' + over.id);
        if(active.id !== over.id) {
            const activeIndex = stageInfo.findIndex(i => i.id === active.id);
            const overIndex = stageInfo.findIndex(i => i.id === over.id);
            const a = arrayMove(stageInfo, activeIndex, overIndex);
            for(let i = 0; i < a.length; i++) {
                a[i].stageOrder = i + 1
                a[i].order = i + 1
            }
            console.log('a', a);
            setStageInfo(a);
            // 在這裡打編輯順序api
            mutateSequence(stageInfo)
        }
        setActiveId(null);
    }
    function handleDragStart(event) {
        console.log('start drag');
        const {active} = event;
        console.log('ACTIVE: ' + active.id);
        setActiveId(active.id);
    }
    const measuringConfig = {
        droppable: {
            strategy: MeasuringStrategy.Always,
        }
    }
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            }
        })
    )
    const onClickFinishStage = async () => {
        if(newStageName === ''){
            setAlertOpen(true)
        } else {
            const stage = {
                stageName: newStageName,
                grouping: (radioValue === 'all') ? false : true,
                stageOrder: stageInfo.length+1
            }
            if(radioValue !== 'all') {
                let teams = [];
                const groupStages = stageInfo.filter((stage) => stage.grouping.toString() === 'true')
                await Promise.all(groupStages[groupStages.length-1].teams.map((team, index) => {
                    const teamInfo = {
                        teamName: team.teamName,
                        teamOrder: index+1,
                        teamMembers: team.teamMembers
                    }
                    teams.push(teamInfo)
                }))
                setMutateTeamsDetail(teams)
            }
            mutateCreateStage(stage)
            setAddStageOpen(false);
            setNewStageName('');
        }
    }
    const onCloseAlert = (event, reason) => {
        if(reason === 'clickaway') {
            return;
        }
        setAlertOpen(false);
    }

    return(
        <Provider value={contextValue}>
            <Box sx={{display:'flex'}}>
                <AppBars position="fixed" color="info" open={openDrawer}>
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="openDrawer"
                            sx={{ mr: 2, ...((!isOwner || openDrawer) ? {display:"none"} : {display: "block"})}}
                            onClick={handleDrawerOpen}
                        >
                            <Menu />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1, letterSpacing:1.8 }}>
                            {(groupInfo!==undefined) && (activityInfo!==undefined) ? groupInfo.groupName+': '+activityInfo.activityName : ""}
                        </Typography>
                    </Toolbar>
                </AppBars>
                <Drawer
                    sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box"
                    }
                    }}
                    variant="persistent"
                    anchor="left"
                    open={openDrawer}
                    PaperProps={{
                        sx: {
                            backgroundColor: "#5A81A8",
                            color: "white"
                        }
                    }}
                >
                    <DrawerHeader style={{position:'fixed', zIndex:1000, left:'180px'}}>
                        <IconButton onClick={handleDrawerClose} color="secondary">
                            {theme.direction === "ltr" ? (
                            <ChevronLeft />
                            ) : (
                            <ChevronRight />
                            )}
                        </IconButton>
                    </DrawerHeader>
                    <Divider />
                    <Box style={{overflowY:'scroll', marginTop:'55px', paddingBottom:'10px'}}>
                        <DndContext
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                            onDragStart={handleDragStart}
                            measuring={measuringConfig}
                            sensors={sensors}
                            modifiers={[restrictToVerticalAxis]}
                        >
                            <Stack spacing={2} sx={{p:'10px', mt:'6px'}}>
                                <SortableContext
                                    items={stageInfo}
                                    strategy={verticalListSortingStrategy}
                                >
                                {stageInfo?.map((stage) => <RoomSortableItem key={stage.id} id={stage.id} id2={`${stage.id}`} name={stage.stageName} grouping={`${stage.grouping}`} order={stage.stageOrder} stagechecked={`${stage.stageChecked}`} activeid={(activeId == stage.id).toString()} />)}
                                </SortableContext>
                            </Stack>
                        </DndContext>
                        <Button onClick={() => setAddStageOpen(true)} variant="contained" color="secondary" style={{width: 220, height: 50, borderRadius:'5px', display:'flex', justifyContent:'center', alignItems:'center', border:'1.5px #BEBEBE dashed', backgroundColor:'rgba(255, 255, 255, 0.8)', margin:'6px 9px'}}>
                            <Typography color="gray">新增活動</Typography>
                        </Button>
                    </Box>
                    
                </Drawer>
                <Main open={openDrawer}>
                    <MainRoomContent groupId={props.groupId} activityId={props.activityId} />
                </Main>
            </Box>
            <Modal
                open={addStageOpen}
                onClose={() => setAddStageOpen(false)}
            >
                <Box style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 260, backgroundColor: 'white', boxShadow: 24, padding:'20px 25px', borderRadius:'5px', display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <TextField style={{marginTop:'10px', width:'100%'}} InputLabelProps={{shrink:true,}} variant="standard" label="1. 活動名稱" color="warning" required value={newStageName} onChange={(e) => setNewStageName(e.target.value)} />
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
                            <Button variant="contained" style={{fontWeight:'bold', marginLeft:'15px'}} onClick={onClickFinishStage}>完成</Button> 
                        </Box>
                    </Box>
                </Box>
            </Modal>
            <Snackbar open={alertOpen} autoHideDuration={6000} onClose={onCloseAlert}>
                <Alerts ref={ref} onClose={onCloseAlert} severity="error"sx={{width:'28vw'}}>
                    請先填寫活動名稱
                </Alerts>
            </Snackbar>
        </Provider>
    );
}