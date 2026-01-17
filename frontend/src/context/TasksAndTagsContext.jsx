import { createContext, useState, useEffect } from "react";
import { getAllTags } from "@/api/Tags";
import { getAllTasks } from "@/api/Tasks";
import { getAllTimestamps } from "@/api/Timestamps";

export const TasksAndTagsContext = createContext();

const TasksAndTagsContextProvider = ({ children }) => {
    const [tasks, setTasks] = useState([])
    const [tags, setTags] = useState([])
    const [timestamps, setTimestamps] = useState([])


    const fetchData = async () => {
        const tasksData = await getAllTasks();
        const tagsData = await getAllTags();
        const timestampsData = await getAllTimestamps();
        setTasks(tasksData);
        setTags(tagsData);
        setTimestamps(timestampsData);
    }

    useEffect(() => {
        fetchData()
    }, [])

    const value = {
        tasks,
        setTasks,
        tags,
        setTags,
        timestamps,
        setTimestamps,
        fetchData,
    };

    return (
        <TasksAndTagsContext.Provider value={value}>
            {children}
        </TasksAndTagsContext.Provider>
    )
}

export default TasksAndTagsContextProvider;