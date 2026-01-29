import React, { useContext, useEffect, useState } from 'react'
import { createTask, getTaskById } from '@/api/Tasks'
import { createTags, getTagByID } from '@/api/Tags'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import { Tag } from 'lucide-react'
import { TasksAndTagsContext } from "../context/TasksAndTagsContext"

const AddTaskAndTagForm = ({ onClose, onSuccess, onError }) => {
    const [taskName, setTaskName] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [tagName, setTagName] = useState("");
    const [tagDescription, setTagDescription] = useState("");

    // Set state of multiple choice of tags
    const [selectedTags, setSelectedTags] = useState([]);


    // set slide button between task and tags
    const [activeToggle, setActiveToggle] = useState("task");

    const { tags, setTasks, setTags } = useContext(TasksAndTagsContext);


    const handleSubmitCreateTask = async (e) => {
        e.preventDefault()

        try {
            if (!taskName.trim()) {
                onError("Task name cannot be empty!")
                return;
            }
            const tagIds = selectedTags.map(tag => tag._id).join(",")
            const newTask = await createTask(taskName, taskDescription, tagIds)
            setTasks(prev => [...prev, newTask]);
            onSuccess("Task successfully created!")

            setTaskName("")
            setTaskDescription("")
            setTagName("")
            setTagDescription("")
            setSelectedTags([])


        } catch (error) {
            onError("Failed to create task!")
        }
    }

    const handleSubmitCreateTag = async (e) => {
        e.preventDefault()

        try {
            if (!tagName.trim()) {
                onError("Tag name cannot be empty!")
                return;
            }
            const newTag = await createTags(tagName, tagDescription)
            setTags(prev => [...prev, newTag])
            onSuccess("Tag successfully created!")

            setTaskName("")
            setTaskDescription("")
            setTagName("")
            setTagDescription("")
            setSelectedTags([])
        } catch (error) {
            onError("Failed to create tag!")
        }
    }



    return (
        <form
            onSubmit={activeToggle === "task" ? handleSubmitCreateTask : handleSubmitCreateTag}
            className="h-auto rounded-lg p-6 xs:p-8 flex flex-col items-start gap-5"
        >

            <div className="relative w-fit flex bg-neutral-800 rounded-lg py-1">
                <div
                    className={`w-1/2 absolute top-1 bottom-1 rounded-md transition-all duration-300  bg-gradient-to-b 
                    from-purple-400 via-blue-400 to-cyan-400 ${activeToggle === "task" ? "left-0" : "left-1/2"}`}>
                </div>

                {["task", "tag"].map(item => (
                    <div
                        key={item}
                        onClick={(e) => { e.preventDefault(); setActiveToggle(item) }}
                        className={`cursor-pointer text-center z-10 py-2 px-1 w-24 text-sm font-medium transition-colors duration-300 
                    ${activeToggle === item ? " text-white" : " text-gray-300"}`}
                    >
                        {item === "task" ? "New Task" : "New Tag"}
                    </div>

                ))}
            </div>

            {activeToggle === "task" ?
                <>
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
                                        {(tag.title || "").charAt(0).toUpperCase() + (tag.title || "").slice(1)}
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
                            Add Task
                        </button>
                    </div>
                </>
                : <>
                    {/* Tag Name */}
                    <div className="flex w-full flex-col gap-1">
                        <label
                            htmlFor="tag_name"
                            className="block mb-1 text-sm font-medium text-white"
                        >
                            Tag name
                        </label>
                        <input
                            type="text"
                            id="tag_name"
                            value={tagName}
                            onChange={(e) => setTagName(e.target.value)}
                            placeholder="Enter tag name"
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
                            value={tagDescription}
                            onChange={(e) => setTagDescription(e.target.value)}
                            placeholder="Enter description"
                            className="w-full px-4 py-2 text-sm text-white bg-neutral-800 border border-neutral-600 rounded-md outline-none focus:border-white transition-colors duration-150"
                        />
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
                            Add Tag
                        </button>
                    </div>
                </>
            }


        </form>
    )
}

export default AddTaskAndTagForm
