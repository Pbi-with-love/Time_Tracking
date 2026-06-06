import React, { useContext, useEffect, useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import { Tag } from 'lucide-react'
import { getTaskById, updateTask } from '../api/Tasks'
import { getTagByID } from '../api/Tags'
import { TasksAndTagsContext } from '../context/TasksAndTagsContext'

const EditTaskForm = ({ onClose, taskId, onSuccess, onError }) => {
    const [taskName, setTaskName] = useState("");
    const [taskDescription, setTaskDescription] = useState("");

    // Set state of multiple choice of tags
    const [selectedTags, setSelectedTags] = useState([]);

    // Set original task before update
    const [originalTask, setOriginalTask] = useState(null);

    const { tags, setTasks } = useContext(TasksAndTagsContext);


    useEffect(() => {
        const fetchTask = async () => {
            const task = await getTaskById(taskId);
            setTaskName(task.title);
            setTaskDescription(task.description);

            const fullTagsInTask = [];

            for (const tagId of task.tags) {
                const tag = await getTagByID(tagId);
                fullTagsInTask.push(tag);
            }

            setSelectedTags(fullTagsInTask);
            setOriginalTask(task);
        }; fetchTask()
    }, [])

    const handleUpdateTask = async (e) => {
        e.preventDefault()

        if (
            taskName === originalTask.title && taskDescription === originalTask.description
            && selectedTags.length === originalTask.tags.length
            && selectedTags.every(tag => originalTask.tags.some(tid => tid === tag._id))
        ) {
            onError("No changes detected, task was not updated!")
            onClose()
            return;
        }

        try {
            const updatedFields = {
                title: taskName,
                description: taskDescription,
                tags: selectedTags.map(tag => tag._id),
            }
            const updatedTask = await updateTask(taskId, updatedFields)
            setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t))
            onSuccess("Task successfully updated!")

            setTaskName("")
            setTaskDescription("")
            setSelectedTags([])
            onClose()
        } catch (error) {
            onError("Failed to update task!")
        }
    }

    return (
        <form
            onSubmit={handleUpdateTask}
            className="h-auto rounded-lg bg-neutral-900 p-6 xs:p-8 flex flex-col items-start gap-5"
        >
            {/* Task Name */}
            <div className="flex w-full flex-col gap-1">
                <label
                    htmlFor="task_name"
                    className="block mb-1 text-sm font-medium text-white"
                >
                    Task name
                </label>
                <input
                    type="text"
                    id="task_name"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="Enter task name"
                    className="px-4 py-2 text-sm text-white bg-neutral-800 border border-neutral-600 rounded-md outline-none focus:border-white transition-colors duration-150"
                />
            </div>

            {/* Description */}
            <div className="flex w-full flex-col gap-1">
                <label
                    htmlFor="description"
                    className="block mb-1 text-sm font-medium text-white"
                >
                    Description
                </label>
                <input
                    type="text"
                    id="description"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Enter description"
                    className="w-full px-4 py-2 text-sm text-white bg-neutral-800 border border-neutral-600 rounded-md outline-none focus:border-white transition-colors duration-150"
                />
            </div>


            {/* Tags */}
            <div className="w-full">
                <p className='text-sm font-medium text-white mb-1'>Tags:{" "}</p>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className='cursor-pointer flex-wrap max-h-[20vh] overflow-y-auto w-full flex items-center gap-2 bg-black mr-1 text-white px-4 py-2 text-sm border border-neutral-600 rounded-md'>
                            {selectedTags.length > 0 ? selectedTags.map((tag) => (
                                <span key={tag._id} className="px-3 py-1 w-fit whitespace-nowrap bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-teal-300 border border-emerald-500/30 rounded-full text-sm font-medium flex items-center gap-1 cursor-pointer">
                                    <Tag size={14} />
                                    <p className=''>{tag.title}</p>
                                </span>
                            )) : <span className="py-2.5 w-fit text-transparent"></span>
                            }
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="start" className="max-h-[30vh] z-1000">
                        {tags.map(tag => (
                            <DropdownMenuCheckboxItem
                                key={tag._id}
                                onSelect={(e) => e.preventDefault()}
                                checked={selectedTags.some(t => t._id === tag._id)}
                                onCheckedChange={(isNowChecked) => {
                                    if (isNowChecked) {
                                        setSelectedTags([...selectedTags, tag])
                                    } else {
                                        setSelectedTags(selectedTags.filter(t => t._id !== tag._id))
                                    }
                                }}
                                className="cursor-pointer"
                            >
                                {tag.title.charAt(0).toUpperCase() + tag.title.slice(1)}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="self-end translate-x-4 flex gap-3">
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); onClose(); }}
                    className="mt-8 cursor-pointer px-5 py-2 border border-neutral-400 text-neutral-400 rounded-lg font-medium hover:bg-neutral-800 hover:text-white transition-all"
                >
                    Cancel
                </button>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="mt-8 cursor-pointer px-5 py-2 bg-white text-black rounded-lg font-medium hover:bg-neutral-300 transition-all"
                >
                    Edit Task
                </button>
            </div>
        </form>
    )
}

export default EditTaskForm