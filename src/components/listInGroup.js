import { Box, Divider, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Switch, Button, IconButton, Collapse } from "@mui/material";
import { MoreHoriz } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { KeyboardArrowRight, KeyboardArrowDown } from "@mui/icons-material";

function createData(name, date, describe) {
  return { name, date, describe };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, '33.7305305305305305305305333333討論活動列表討論活動列表討論活動列表討論活動列表討論活動列表討論活動列表討論活動列表討論活動列表討論活動列表討論活動列表討論活動列表', 24, 6.0),
  createData('Cupcake', 305, '33.7305305305305305305305333333討論活動列表討論活動列表討論活動列表討論活動列表討論活動列表討論活動列表討論活動列表討論活動列表討論活動列表討論活動列表討論活動列表', 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];
const Rows = (props) => {
    const [open, setOpen] = useState(false);
    return(
    <TableRow
    style={{maxHeight: '10px'}}
    // key={row.name}
    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
        <TableCell style={{width:'2%', padding:0, verticalAlign:'baseline'}}>
        {props.row.describe.length >= 31 && 
        <IconButton onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
        </IconButton>
        }
        </TableCell>
        <TableCell style={{width:'20%'}} component="th" scope="row">
            {props.row.name}
        </TableCell>
        <TableCell style={{width:'15%'}} align="center">{props.row.date}</TableCell>  
        {!open ? 
        <TableCell 
        style={{width:'30%', maxWidth:'20vw', whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden'}} 
        >
            {props.row.describe}
        </TableCell> :
        <TableCell style={{width:'30%'}}>{props.row.describe}</TableCell>
        }
        <TableCell style={{width:'5%'}} align="center">
            <Button variant="contained" color="secondary">分組</Button>
        </TableCell>
        <TableCell style={{width:'6%'}} align="center">
            <Switch color="info" />
        </TableCell>
        <TableCell style={{width:'17%'}} align="center">
            <Button variant="contained">開始討論</Button>
        </TableCell>
        <TableCell style={{width:'5%'}} align="center">
            <IconButton><MoreHoriz sx={{color:'grey', fontSize:'20px'}} /></IconButton>
        </TableCell>
    </TableRow>
    );
}
export default function ListInGroup() {
    return(
        <Box m={'2vw 3vw 2vw 3vw'}>
        <Paper style={{marginTop:'15px', backgroundColor:'white', padding:'2vw', marginBottom:'30px'}}>
            <div style={{fontWeight:'bold', fontSize:'1.5vw'}}>討論活動列表</div>
            <Divider style={{marginTop:'15px', borderColor:'#707070'}}/>
            <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                    <TableRow>
                        <TableCell style={{width:'2%'}} align="center"> </TableCell>
                        <TableCell style={{width:'20%', padding:0}}>討論活動名稱</TableCell>
                        <TableCell style={{width:'15%'}} align="center">討論日期</TableCell>
                        <TableCell style={{width:'30%'}} align='center'>活動描述</TableCell>
                        <TableCell style={{width:'5%'}} align="center"> </TableCell>
                        <TableCell style={{width:'6%'}} align="center">開啟權限</TableCell>
                        <TableCell style={{width:'17%'}} align="center"> </TableCell>
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
    );
}