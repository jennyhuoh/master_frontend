import { useSortable } from "@dnd-kit/sortable";
import {CSS} from '@dnd-kit/utilities';
import { RoomItem } from "./roomItem";

export function RoomSortableItem(props) {
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

    return(
        <RoomItem ref={setNodeRef} style={style} {...attributes} {...listeners} {...props} activeid={props.activeid.toString()} />
    )
}