import React, {forwardRef} from 'react';
import { Box, Button, Modal, Typography } from '@mui/material';
import { DragHandle, DeleteOutline } from "@mui/icons-material";
import { useMutation } from "react-query";
import { deleteStage } from "../features/api";
import { useState, useContext, useEffect } from 'react';
import context from '../context';

export const Item = forwardRef(({id, listeners, attributes, style, ...props}, ref) => {
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const { deleteAStage, getTeamsBtn } = useContext(context);
  const {mutate} = useMutation(deleteStage);
// console.log('s', stages)
  const onClickDeleteStage = () => {
    console.log('here')
    setAlertModalOpen(true);
    // mutate(props.id);
  }

  return (
    <>
      <div {...props} ref={ref}>
          <Box style={{width: '170px', height: '120px', borderRadius:'5px', margin:'0 8px 5px 8px', border:'2px solid rgba(0,0,0,0.2)', boxShadow:'1px 1px 3px 1px rgba(0,0,0,0.1)', display:'grid'}}>
              <DragHandle {...props} {...listeners} color="disabled" style={{marginTop:'-3px', justifySelf:'center'}} />
              <Typography sx={{ml:'14px', fontSize:'14px', fontWeight:'bold', justifySelf:'flex-start'}}>
                  {props.order}. {props.name}
              </Typography>
              {(props.grouping !== 'false') ? 
              <div style={{display:'flex'}}>
                <Typography sx={{justifySelf:'flex-start', fontSize:'16px', fontWeight:'bold', ml:'14px'}}>● <span style={{fontSize:'12px'}}>分組討論</span></Typography>
                <Button sx={{height:'28px'}} size="small" variant="contained" color="secondary" style={{marginLeft:'12px'}} onClick={() => {getTeamsBtn(id)}}>查看分組</Button>
              </div> :
              <Typography sx={{ml:'14px', fontSize:'16px', fontWeight:'bold', justifySelf:'flex-start'}}>● <span style={{fontSize:'12px'}}>全體討論</span></Typography> 
              }
              <Button variant="outlined" color="error" style={{maxWidth:'25px', maxHeight:'25px', minWidth:'25px', minHeight:'25px', justifySelf:'flex-end', marginRight:'14px'}} onClick={onClickDeleteStage}>
                  <DeleteOutline sx={{fontSize:20}} />
              </Button>
          </Box>
      </div>
      <Modal
          open={alertModalOpen}
          onClose={() => setAlertModalOpen(false)}
      >
          <Box style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 260, backgroundColor: 'white', boxShadow: 24, padding:'20px 25px', borderRadius:'5px'}}>
              請問確定要刪除此活動嗎?
              <Box style={{display:'flex', marginTop:'25px', justifyContent:'flex-end'}}>
                  <Button variant="outlined" color="error" style={{fontWeight:'bold'}} onClick={() => {deleteAStage(id)}}>確定</Button>
                  <Button variant="contained" color="secondary" style={{fontWeight:'bold', marginLeft:'12px'}} onClick={() => setAlertModalOpen(false)}>取消</Button>
              </Box>
          </Box>
      </Modal>
    </>
  )
});