import { TextField, Box, Grid, Button } from "@mui/material";
import Select from 'react-select';
import { ArrowBackIosNew } from "@mui/icons-material";
import { useState, useEffect } from 'react';
import { DatePicker, LocalizationProvider, } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Link } from "react-router-dom";
import Header from '../components/header.js';
import dayjs from "dayjs";
import DiscussGroupInfo from "../components/discussGroupInfo.js";
import ListInGroup from "../components/listInGroup.js";

export default function DiscussGroup() {
    return(
        <Box style={{backgroundColor:'#EEF1F4', padding:'0', margin:'0',}}>
            <Header />
            <DiscussGroupInfo />
            <ListInGroup />
            <div style={{backgroundColor:'#EEF1F4', height:'2vw'}}></div>
        </Box>
    );
    
}