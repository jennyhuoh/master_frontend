import { Box, Grid, Button, Container, Typography, IconButton, Toolbar, AppBar, Drawer, Divider, List, ListItemButton, Collapse, ListItemText } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { useKeycloak } from "@react-keycloak/web";
import { Menu, ChevronLeft, ChevronRight, ExpandLess, ExpandMore } from "@mui/icons-material";
import { useState } from 'react';

const drawerWidth = 240;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end"
}));

export default function Header() {
    const theme = useTheme();
    const [openDrawer, setOpenDrawer] = useState(false);
    const [openHome, setOpenHome] = useState(true);
    const [openHistory, setOpenHistory] = useState(false);
    const { keycloak } = useKeycloak();

    const handleDrawerOpen = () => {
        setOpenDrawer(true);
      };
    
    const handleDrawerClose = () => {
        setOpenDrawer(false);
    };

    const handleClickHome = () => {
        setOpenHome(!openHome);
    };
    const handleClickHistory = () => {
        setOpenHistory(!openHistory);
    };

    return(
        <Box sx={{ flexGrow: 1 }} style={{marginBottom:"100px"}}>
            <AppBar position="fixed" color="warning" open={openDrawer}>
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
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    OCLP
                </Typography>
                {keycloak.authenticated ?
                    <Button variant="outlined" color="secondary" onClick={() => keycloak.logout()}>Logout</Button> :
                    <Button variant="outlined" color="secondary" onClick={() => keycloak.login()}>Login</Button>
                }
                </Toolbar>
            </AppBar>
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
                        backgroundColor: "#2B3143",
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
                <List
                    sx={{ width: '100%', maxWidth: 360 }}
                    component="nav"
                    aria-labelledby="nested-list-subheader"
                >
                    <ListItemButton onClick={handleClickHome}>
                        <ListItemText primary="首頁" />
                        {openHome ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={openHome} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItemButton sx={{ pl: 4 }}>
                                <ListItemText primary="討論活動群組" />
                            </ListItemButton>
                            <ListItemButton sx={{ pl: 4 }}>
                                <ListItemText primary="單一討論活動" />
                            </ListItemButton>
                        </List>
                    </Collapse>
                    <ListItemButton onClick={handleClickHistory}>
                        <ListItemText primary="歷史紀錄" />
                        {openHistory ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={openHistory} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItemButton sx={{ pl: 4 }}>
                                <ListItemText primary="歷史討論活動群組" />
                            </ListItemButton>
                            <ListItemButton sx={{ pl: 4 }}>
                                <ListItemText primary="歷史單一討論活動" />
                            </ListItemButton>
                        </List>
                    </Collapse>
                </List>
            </Drawer>
        </Box>
    );
}