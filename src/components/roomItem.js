import React, {forwardRef, useContext} from 'react';
import context from '../context';
import { Box, Typography, Card, CardContent, Checkbox } from "@mui/material";

export const RoomItem = forwardRef(({id, listeners, attributes, styles, ...props}, ref) => {
    const {editStageFunc} = useContext(context);
    const onChangeCheckbox = (e) => {
        console.log('props', props)
        console.log('id', props.id)
        console.log('id2', props.id2)
        const id = parseInt(props.id2, 10);
        if(props.stagechecked === 'true') {
            editStageFunc(id, false);
        } else {
            editStageFunc(id, true); 
        }
    }

    return(
        <div {...props} ref={ref}>
            <Card sx={{p:'6px', pb:0}}>
                <CardContent xs={{paddingBottom:'0'}}>
                    <Typography style={{fontSize:'16px', fontWeight:'bold'}} component="div">
                        {props.order}. {props.name}
                    </Typography>
                    <Box sx={{display:'flex', alignItems:'center', mt:1}}>
                        <Checkbox color="success" checked={props.stagechecked === 'true' ? true : false} onChange={(e) => onChangeCheckbox(e)} />
                        <Typography>階段開始</Typography>
                    </Box>
                </CardContent>
            </Card>
        </div>
        
    );
})