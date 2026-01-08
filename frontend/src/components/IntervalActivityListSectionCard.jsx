import { TasksAndTagsContext } from "../context/TasksAndTagsContext"
import { useContext, useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

const IntervalActivityListSectionCard = ({ title, subtitle, selectedTask, setSelectedTask }) => {

    const { tasks } = useContext(TasksAndTagsContext);
    const [isExpanded, setIsExpanded] = useState(0);

    

    return (
        <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700 mb-6 flex justify-between items-center">
            <div>
                <h2 className="text-lg xs:text-xl font-semibold mb-1 text-white">{title}</h2>
                <p className="text-neutral-400 xs:text-sm text-xs">{subtitle}</p>
            </div>
            
            <div className="text-right ml-auto">
                <p className="text-sm text-neutral-400 mb-2">Select Task to Analyze</p>
                <DropdownMenu onOpenChange={setIsExpanded}>
                    <DropdownMenuTrigger asChild>
                        <button className="px-3 xs:px-5 max-w-[100px] xs:max-w-[200px] py-2 ml-auto bg-neutral-700 rounded-lg flex items-center gap-2 hover:bg-neutral-600 transition-colors duration-300 cursor-pointer">
                            <span className="flex-1 text-sm xs:text-sm md:text-base truncate overflow-hidden whitespace-nowrap">
                                {selectedTask ? selectedTask.title.charAt(0).toUpperCase() + selectedTask.title.slice(1) : "-- Select task --"}
                            </span>
                            <ChevronDown
                                size={18}
                                className={`w-5 h-5 text-neutral-400 transform transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                            />
                        </button>


                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="end" className="max-h-[200px] mt-3 flex max-w-[200px] flex-wrap">
                        {tasks.map((task) => (
                            <DropdownMenuCheckboxItem
                                key={task._id}
                                onSelect={(e) => e.preventDefault()}
                                checked={selectedTask?._id === task._id}
                                onCheckedChange={() => setSelectedTask(task)}
                                className="cursor-pointer w-full"
                            >
                                {task.title.charAt(0).toUpperCase() + task.title.slice(1)}
                            </DropdownMenuCheckboxItem>
                        ))}

                    </DropdownMenuContent>
                </DropdownMenu>

            </div>
        </div>
    )
}

export default IntervalActivityListSectionCard