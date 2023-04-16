import { useMutation } from "react-query";
import { getRecordings } from "../features/api";
import { Box, Divider, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button, Grid, TextField, Typography, Alert, Snackbar, Modal, Radio, IconButton } from "@mui/material";
import { useState, useEffect } from 'react';

export default function BlankPage() { 
  const [audioBuffer, setAudioBuffer] = useState(null);
  const {mutate} = useMutation(getRecordings, {
    onSuccess: (data) => {
      console.log('get recording success')
      setAudioBuffer(data)
    }
  })

  useEffect(() => {
    if(audioBuffer !== null) {
      console.log('buffer',  audioBuffer)
    }
  }, [audioBuffer])
  
  const onClick = () => {
    mutate({
      stageId: 22,
      teamId: "eeb225b1-5764-4d88-b098-0a40587759ed"
    })
  }

  return (
    <Box>
      <Button onClick={onClick}>Click</Button>
      {audioBuffer?.map((audio) => {
        return(<audio key={audio.info.id} src={audio.recordingUrl} controls />)
      })}
    </Box>
  )
}
