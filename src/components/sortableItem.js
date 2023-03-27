import { useSortable } from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import { Box } from '@mui/material';

export function SortableItem(props) {
    // props.id
    // JavaScript

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({id: props.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Box style={{width: 180, height: 120, borderRadius:'5px', backgroundColor:'pink', display:'flex', alignItems:'center', justifyContent:'center'}}>{props.content}</Box>
        </div>
    )
}