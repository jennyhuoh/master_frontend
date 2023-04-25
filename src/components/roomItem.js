import React, {forwardRef, useContext} from 'react';
import context from '../context';
import { Box, Typography, Card, CardContent, Checkbox } from "@mui/material";

export const RoomItem = forwardRef(({id, listeners, attributes, styles, ...props}, ref) => {
    const {editStageFunc} = useContext(context);
    const onChangeCheckbox = (e) => {
        if(props.stagechecked === 'true') {
            editStageFunc(props.id, false);
        } else {
            editStageFunc(props.id, true); 
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