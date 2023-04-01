import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy
} from "@dnd-kit/sortable";
import GroupSortableItem from "./groupSortableItem";

export default function Container(props) {
    const { id, items } = props;
    console.log(items)
  const { setNodeRef } = useDroppable({
    id
  });

  return (
    <SortableContext
      id={id}
      items={items}
      strategy={horizontalListSortingStrategy}
    >
      <div ref={setNodeRef} style={props.style}>
        {items?.map((item) => (
          <GroupSortableItem key={item.id} id={item.id} name={item.label} />
        ))}
      </div>
    </SortableContext>
  );
}
