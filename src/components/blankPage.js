import {
    DndContext,
    closestCenter
  } from "@dnd-kit/core";
  import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    horizontalListSortingStrategy
  } from "@dnd-kit/sortable";
  import {useState} from 'react';
  import { SortableItem } from './sortableItem';
  
  export default function BlankPage() {
    const [stages, setStages ] = useState([{id:1, content:"J", order:1}, {id:2, content:"P", order:2}, {id:3, content:"T", order:3}]);

    return (
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="p-3" style={{"width": "50%", backgroundColor:'lightBlue', display:'flex', flexDirection:'row'}} align="center">
          <SortableContext
            items={stages}
            strategy={horizontalListSortingStrategy}
          >
            {/* We need components that use the useSortable hook */}
            {stages.map(stage => <SortableItem key={stage.id} id={stage.id} content={stage.content}/>)}
          </SortableContext>
        </div>
      </DndContext>
    );
  
    function handleDragEnd(event) {
        // console.log("Drag end called");
        const {active, over} = event;
        console.log("ACTIVE: " + active.id);
        console.log("OVER :" + over.id);
        
        if(active.id !== over.id) {
            const activeIndex = stages.findIndex(i => i.id === active.id);
            const overIndex = stages.findIndex(i => i.id === over.id);
            console.log(arrayMove(stages, activeIndex, overIndex));
            setStages(arrayMove(stages, activeIndex, overIndex))
        }
    }
    
  }