import { Box, Typography, IconButton, Toolbar, AppBar, Drawer, Divider, Stack } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { Menu, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useState, useEffect } from 'react';
import { getGroupInfo, getAnActivity, editStage, saveStagesSequence } from '../features/api';
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

    const editStageFunc = (id, checked) => {
        stageMutate({
            id: id,
            stage: {
                stageChecked: checked
            }
        })
    }
    const contextValue = {editStageFunc, stageInfo, checkingStage};

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
                    <DrawerHeader>
                        <IconButton onClick={handleDrawerClose} color="secondary">
                            {theme.direction === "ltr" ? (
                            <ChevronLeft />
                            ) : (
                            <ChevronRight />
                            )}
                        </IconButton>
                    </DrawerHeader>
                    <Divider />
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
    {/* <StageCard key={stage.id} id={stage.id} name={stage.stageName} grouping={`${stage.grouping}`} order={stage.stageOrder} stageChecked={stage.stageChecked} /> */}
                            {stageInfo?.map((stage) => <RoomSortableItem key={stage.id} id={stage.id} name={stage.stageName} grouping={`${stage.grouping}`} order={stage.stageOrder} stagechecked={`${stage.stageChecked}`} activeid={(activeId == stage.id).toString()} />)}
                            </SortableContext>
                        </Stack>
                    </DndContext>
                    
                </Drawer>
                <Main open={openDrawer}>
                    <MainRoomContent groupId={props.groupId} activityId={props.activityId} />
                </Main>
            </Box>
        </Provider>
    );
}