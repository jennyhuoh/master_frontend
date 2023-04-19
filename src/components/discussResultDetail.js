import { Box, Select, MenuItem, Paper, MenuList, Typography, Divider } from "@mui/material";
import { useQuery } from "react-query";
import { getAnActivity, getRecordings } from "../features/api";
import { useState, useEffect } from "react";

export default function DiscussResultDetail(props) {
    let activityId = props.activityId;
    const [activityInfo, setActivityInfo] = useState(null);
    const [stageInfo, setStageInfo] = useState(null);
    const [selectValue, setSelectValue] = useState();
    const [teams, setTeams] = useState();
    const [selectedTeam, setSelectedTeam] = useState()
    const {data} = useQuery(['activity', activityId], () => getAnActivity(activityId), {
        onSuccess: () => setActivityInfo(data)
    })

    useEffect(() => {
        setActivityInfo(data)
    }, [data])

    useEffect(() => {
        if(activityInfo) {
            let stages = activityInfo.stagesForActivity
            stages = stages.filter((stage) => stage.grouping === true)
            setStageInfo(stages)
        }
    }, [activityInfo])
    useEffect(() => {
        if(stageInfo) {
            setSelectValue(stageInfo[0].id)
        }
    }, [stageInfo])
    useEffect(() => {
        if(stageInfo) {
            if(stageInfo.length > 1){
                let stage = stageInfo.filter((stage) => stage.id === selectValue)
                setTeams(stage[0].teams)
            } else {
                setTeams(stageInfo[0].teams)
            }
        }
        
    }, [selectValue])
    const onClickTeam = (id) => {
        console.log('team id', id)
        setSelectedTeam(id)
    }
    // console.log('stages', stageInfo)
    // console.log('select', selectValue)
    return(
        <Box style={{display:'flex', padding:'200px 100px', justifyContent:'center'}}>
            {/* vis.js & audio area */}
            <Box style={{width:'700px', backgroundColor:'pink'}}></Box>
            {/* select area */}
            <Box>
                <Select color="warning" onChange={(e) => setSelectValue(e.target.value)} value={selectValue || ""} style={{width:'220px', marginLeft:'20px'}}>
                {stageInfo?.map((stage) => (<MenuItem key={stage.id} value={stage.id}>{stage.stageName}</MenuItem>))}
                </Select>
                <Paper sx={{p:2, mt:3, pb:1}} style={{width:'190px', marginLeft:'20px', display:'flex', flexDirection:'column'}}>
                    <Typography style={{fontWeight:'bold', alignSelf:'center'}}>選擇查看的組別</Typography>
                    <Divider sx={{mt:1}} />
                    <MenuList>
                    {teams?.map((team) => (<MenuItem selected={selectedTeam === team.id} onClick={() => onClickTeam(team.id)} key={team.id}>組別 {team.teamName}</MenuItem>))}
                    </MenuList>
                </Paper>
            </Box>
        </Box>
    );
}