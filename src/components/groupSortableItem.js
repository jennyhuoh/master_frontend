import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function GroupItem(props) {
    const {id, name} = props;
    const style = {
        // width: "100%",
        minHeight: 43,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid #2B3143",
        margin: "5px",
        background: "#EEF1F4",
        minWidth: "60px",
        borderRadius: "3px",
      };
    return (
        <div style={style}>
            {name}
        </div>);
}

export default function GroupSortableItem(props) {
    // console.log('gsi', props.id)
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
    };

    return(
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {/* {console.log('name', props.name)} */}
            <GroupItem id={props.id} name={props.name} />
        </div>
    );
}