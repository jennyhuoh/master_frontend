import { Box, IconButton, Paper, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Switch } from "@mui/material";
import { ArrowBackIosNew } from "@mui/icons-material";
import { Link } from "react-router-dom";

function createTeam(name, members){
    return { name, members };
}

const teams = [
    createTeam("Team 1", ['student1', 'student2', 'student3']),
    createTeam("Team 2", ['student4', 'student5', 'student6']),
    createTeam("Team 3", ['student8', 'student9', 'student7']),
]

export default function GroupResultContent() {
    if(true){
        return(
        <Box m={'3vw 3vw 2vw 3vw'}>
           <IconButton style={{color:'black', marginBottom:'5px'}} component={Link} to='/discussGroup'>
                <ArrowBackIosNew sx={{fontSize:'1.5vw'}} />
           </IconButton>
           <span style={{fontWeight:'bold', fontSize:'2vw', marginLeft:'10px'}}>'名稱' 分組</span>
            <TableContainer style={{marginTop:'15px', backgroundColor:'white'}} component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell style={{width:'25%'}}>小組名稱</TableCell>
                            <TableCell style={{width:'50%'}}>成員</TableCell>
                            <TableCell align="center" style={{width:'10%'}}>開啟權限</TableCell>
                            <TableCell align="center" style={{width:'15%'}}>全部開啟<Switch color="info" /></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {teams.map((team) => (
                            <TableRow
                             key={team.name}
                             style={{maxHeight:'10px'}}
                             sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
        );
    } else {return(<></>);}
}