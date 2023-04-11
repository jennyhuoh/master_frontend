import { Box, Typography, IconButton, Toolbar, AppBar, Drawer, Divider, Stack } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { Menu, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useState, useEffect } from 'react';
import { getGroupInfo, getAnActivity } from '../features/api';
import { useQuery, useMutation } from 'react-query';
import MainRoomContent from "../components/mainRoomContent";

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
    const [stageInfo, setStageInfo] = useState(undefined);
    const {data:groupData} = useQuery(['group', groupId], () =>
    getGroupInfo(groupId), {
        onSuccess: async() => {
            setGroupInfo(groupData)
        }
    })
    const {mutate} = useMutation(getAnActivity, {
        onSuccess: async(data) => {
            setActivityInfo(data)
            setStageInfo(data?.stagesForActivity)
        }
    })
    // if(localStorage.getItem('discussType') === 'all') {
    //     const {data:activityData} = useQuery(['activity', roomID], () =>
    //     getAnActivity(roomID), {
    //         onSuccess: async() => {
    //             setActivityInfo(activityData)
    //         }
    //     })
    // }
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

    return(
        <Box sx={{display:'flex'}}>
            <AppBars position="fixed" color="info" open={openDrawer}>
                <Toolbar>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="openDrawer"
                    sx={{ mr: 2, ...(openDrawer && {display:"none"}) }}
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
                {/* {stageInfo?.map((stage) => {<StageCard key={stage} id={stage.id} name={stage.name} grouping={`${stage.grouping}`} />})} */}
            </Drawer>
            <Main open={openDrawer}>
                <MainRoomContent groupId={props.groupId} activityId={props.activityId} />
            </Main>
        </Box>
    );
}