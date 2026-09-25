import { createContext, useState, useEffect, useContext } from "react";
import { getAllTags } from "@/api/Tags";
import { getAllTasks } from "@/api/Tasks";
import { getAllTimestamps } from "@/api/Timestamps";
import { AuthContext } from "./AuthContext"

export const TasksAndTagsContext = createContext();

const TasksAndTagsContextProvider = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    const [dataLoading, setDataLoading] = useState(false);
    const [tasks, setTasks] = useState([])
    const [tags, setTags] = useState([])
    const [timestamps, setTimestamps] = useState([])


    const fetchData = async () => {
        try {
            setDataLoading(true);

            const [tasksData, tagsData, timestampsData] =
                await Promise.all([
                    getAllTasks(),
                    getAllTags(),
                    getAllTimestamps(),
                ]);

            setTasks(tasksData);
            setTags(tagsData);
            setTimestamps(timestampsData);

        } catch (err) {
            console.error(err);
        }
        finally {
            setDataLoading(false);
        }
    }

    useEffect(() => {
        if (!loading && user) {
            fetchData();
        }
    }, [loading, user])

    const value = {
        tasks,
        setTasks,
        tags,
        setTags,
        timestamps,
        setTimestamps,
        fetchData,
        dataLoading
    };

    return (
        <TasksAndTagsContext.Provider value={value}>
            {children}
        </TasksAndTagsContext.Provider>
    )
}

export default TasksAndTagsContextProvider;