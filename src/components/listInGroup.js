import { Box, Divider, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
            <Button variant="contained">開始討論</Button>
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

export default function ListInGroup() {
    if(true){
    return(
        <Box m={'2vw 3vw 2vw 3vw'}>
        <Paper style={{marginTop:'15px', backgroundColor:'white', padding:'2vw', marginBottom:'30px'}}>
            <div style={{fontWeight:'bold', fontSize:'1.5vw'}}>討論活動列表</div>
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
    );} else {
        return(<></>);
    }
}