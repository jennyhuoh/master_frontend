import { Box, Select, MenuItem, Paper, MenuList, Typography, Divider, IconButton, ToggleButtonGroup, ToggleButton  } from "@mui/material";
import { useQuery, useMutation } from "react-query";
import { getAnActivity, getRecordings } from "../features/api";
import { useState, useEffect, useRef } from "react";
import { ArrowBackIosNew } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Network } from "vis-network";
import { XYPlot, VerticalGridLines, HorizontalGridLines, XAxis, YAxis, VerticalBarSeries, LabelSeries} from 'react-vis';
import { DataSet } from "vis-data/peer/esm/vis-data"
import AvatarGroup from "react-avatar-group";
import randomColor from 'randomcolor';

export default function DiscussResultDetail(props) {
    let activityId = props.activityId;
    let color = randomColor()
    let navigate = useNavigate();
    const visJsRef = useRef(null);
    const BarSeries = VerticalBarSeries;
    const [activityInfo, setActivityInfo] = useState(null);
    const [stageInfo, setStageInfo] = useState(null);
    const [selectValue, setSelectValue] = useState();
    const [teams, setTeams] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [audioBuffer, setAudioBuffer] = useState(null);
    const [borderColor, setBorderColor] = useState(color);
    const [nodes, setNodes] = useState(null);
    const [edges, setEdges] = useState(null);
    const [barData, setBarData] = useState(null);
    const [toggleValue, setToggleValue] = useState('relation');
    
    const {data} = useQuery(['activity', activityId], () => getAnActivity(activityId), {
        onSuccess: () => setActivityInfo(data)
    })
    const {mutate} = useMutation(getRecordings, {
        onSuccess: (data) => {
            setAudioBuffer(data)
        }
    })
    useEffect(() => {
        if(nodes !== null) {
            console.log('edges', edges)
            const data = {
                nodes: new DataSet(nodes),
                edges: new DataSet(edges)
            }
            const network = visJsRef.current && new Network(visJsRef.current, data, {
                autoResize: true,
                edges: {
                    color: "#411811"
                }
            })
        }
    }, [visJsRef, nodes, edges, toggleValue])

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
    useEffect(() => {
        if(teams) {
            setSelectedTeam(teams[0].id)
        }
    }, [teams])
    useEffect(() => {
        if(selectedTeam) {
            mutate({
                stageId: selectValue,
                teamId: selectedTeam
            })
            console.log('selected team', selectedTeam)
        }
    }, [selectedTeam])
    useEffect(() => {
        if(audioBuffer !== null) {
        //   console.log('buffer',  audioBuffer)
          arrangeNode();
        }
        let nodeArr = []
        let edgeArr = []
        let barArr = []
        async function arrangeNode() {
            const filterStage = stageInfo.length === 1 ? stageInfo[0] : stageInfo.filter((stage) => stage.id === selectValue)
            const filterTeam = await filterStage.teams.filter((team) => team.id === selectedTeam)
            // console.log('stage', filterStage)
            // console.log('team', filterTeam)
            await Promise.all(filterTeam[0].teamMembers.map((member) => {
                const data = {
                    id: member.id,
                    label: member.label
                }
                nodeArr.push(data)
            })).then(() => {
                setNodes(nodeArr)
            }).then(async () => {
                console.log('audioBuffer', audioBuffer)
                await Promise.all(audioBuffer?.map((item) => {
                    let index = -1
                    if(edgeArr.length !== 0) {
                        index = edgeArr.findIndex((edge) => edge.from === item.info.recordAuthorId && edge.to === item.info.recordTargetId)
                    }
                    if(index === -1) {
                        const data = {
                            from: item.info.recordAuthorId,
                            to: item.info.recordTargetId,
                            arrows:"to",
                            label:'1'
                        }
                        edgeArr.push(data)
                    } else {
                        let newEdge = edgeArr
                        let newLabel = parseInt(newEdge[index].label)
                        // console.log('newLabel', newLabel)
                        newEdge[index].label = (newLabel+1).toString()
                        edgeArr = newEdge
                    }
                    if(barArr.length !== 0) {
                        const index = barArr.findIndex((barItem) => barItem.x === item.info.recordAuthor)
                        if(index !== -1) {
                            barArr[index].y = barArr[index].y + 1
                        } else {
                            const data3 = {
                                x: item.info.recordAuthor,
                                y: 1
                            }
                            barArr.push(data3); 
                        }
                    } else {
                        const data2 = {
                            x: item.info.recordAuthor,
                            y: 1
                        }
                        barArr.push(data2);
                    }
                }))
            }).then(() => {
                setEdges(edgeArr)
                setBarData(barArr)
            })
        }
      }, [audioBuffer])
    const onClickTeam = (id) => {
        // console.log('team id', id)
        setSelectedTeam(id)
    }
    const onChangeSelected = (event, newEvent) => {
        // console.log('newEvent', newEvent)
        setToggleValue(newEvent)
    }
    // console.log('stages', stageInfo)
    // console.log('teams', teams)
    // console.log('select', selectedTeam)
    return(
        <Box m={'0 3vw 2vw 3vw'} sx={{pt:'12vh'}}>
            <Box style={{display:'flex', alignItems:'center'}}>
                <IconButton style={{color:'black'}} onClick={() => {navigate(-1)}}><ArrowBackIosNew sx={{fontSize:'1.5vw'}} /></IconButton>
                <Typography style={{fontWeight:'bold', fontSize:'2vw', marginLeft:'10px'}}>回上一頁</Typography>
            </Box>
            <Box style={{display:'flex', padding:'0 80px 80px 80px', justifyContent:'center'}}>
            {/* vis.js & audio area */}
                <Box style={{width:'70vw', display:'flex', height:'70vh', marginTop:'4.5vh'}}>
                    {/* vis.js area */}
                    <Paper style={{width:'50vw'}}>
                        <ToggleButtonGroup
                            value={toggleValue}
                            onChange={onChangeSelected}
                            exclusive
                        >
                            <ToggleButton style={{fontWeight:'bold', margin:'13px 0 13px 20px', letterSpacing:'0.6px'}} value={'relation'}>討論關聯圖</ToggleButton>
                            <ToggleButton style={{fontWeight:'bold', margin:'13px 0', letterSpacing:'0.6px'}} value={'bar'}>發言次數表</ToggleButton>
                        </ToggleButtonGroup>
                        {toggleValue === 'relation' ? 
                        <div ref={visJsRef} style={{height:'450px', width:'640px'}}/>
                        : 
                        <XYPlot
                            animation
                            xType="ordinal"
                            width={530}
                            height={420}
                            xDistance={50}
                        >
                            <VerticalGridLines />
                            <HorizontalGridLines />
                            <XAxis />
                            <YAxis />
                            <BarSeries barWidth={0.3} data={barData} />
                        </XYPlot>
                        }
                    </Paper>
                    {/* recording area */}
                    <Paper style={{padding:'15px 8px', display:'flex', flexDirection:'column', alignItems:'center', overflowY:'scroll'}}>
                        <Typography style={{fontWeight:'bold'}}>討論語音紀錄</Typography>
                        <Divider sx={{m:'10px 0 0 5px'}} style={{width:'90%', borderWidth:'1px'}} />
                    {audioBuffer?.map((audio) => {
                    return(
                    <Box key={audio.info.id} style={{display:'flex', alignItems:'center', marginTop:'8px'}}>
                            <AvatarGroup
                                avatars={[`${audio.info.recordAuthor}`]}
                                size={43}
                                fontSize={0.3}
                                initialCharacters={3}
                                hideTooltip={true}
                                avatarStyle={{border:`2px solid ${borderColor}`}}
                            />
                            {/* <Typography>{audio.info.recordAuthor}</Typography> */}
                            <audio style={{width:'14vw', marginLeft:'8px'}} src={audio.recordingUrl} controls />
                        </Box>
                    )
                    })}
                    </Paper>
                </Box>
                {/* select area */}
                <Box sx={{mt:'4.5vh'}}>
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
        </Box>
    );
}