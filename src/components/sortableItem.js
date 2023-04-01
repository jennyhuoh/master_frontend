import { useSortable } from "@dnd-kit/sortable";
import { useDraggable } from "@dnd-kit/core";
import {CSS} from "@dnd-kit/utilities";
import { Box, Button, Modal, Typography } from '@mui/material';
import { DragHandle, DeleteOutline } from "@mui/icons-material";
import { useMutation } from "react-query";
import { deleteStage } from "../features/api";
import { useState } from 'react';
import { Item } from "./item";

export function SortableItem(props) {
    // const {mutate} = useMutation(deleteStage);
    // const [alertModalOpen, setAlertModalOpen] = useState(false);
    // const {attributes, listeners, setNodeRef} = useDraggable({id:props.id})

    // props.id
    // JavaScript

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({
        id: props.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    }

    return (
        <>
            <Item ref={setNodeRef} style={style} {...attributes} {...listeners} {...props} activeid={props.activeid.toString()}>
            </Item>
        </>
    )
}