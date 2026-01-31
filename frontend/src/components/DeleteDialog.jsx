import React, { useContext } from 'react'
import { TriangleAlert } from 'lucide-react'
import { deleteTask, deleteTagInTaskByTagId } from '../api/Tasks'
import { deleteTag } from '../api/Tags'
import { getTimestampByTaskId, deleteTimestamp } from '../api/Timestamps'
import { TasksAndTagsContext } from '../context/TasksAndTagsContext'

const DeleteDialog = ({
    onClose,
    id,
    onSuccess,
    onError,
    message,
    subMessage,
    type
}) => {

    const { tasks, setTasks, tags, setTags, timestamps, setTimestamps } = useContext(TasksAndTagsContext);

    const handleDelete = async () => {
        try {
            if (type === "task") {
                const timeForTask = await getTimestampByTaskId(id);
                await Promise.all([deleteTask(id), ...timeForTask.map(ts => deleteTimestamp(ts._id))]);

                setTasks(prev => prev.filter(t => t._id !== id));
                setTimestamps(prev => prev.filter(ts => !timeForTask.some(t => t._id === ts._id)));

                onSuccess("Task successfully deleted!");
            } else if (type === "tag") {
                await Promise.all([deleteTag(id), deleteTagInTaskByTagId(id)])
                setTags(prev => prev.filter(t => t._id !== id));
                setTasks(prev =>
                    prev.map(task => {
                        const tagsArray = task.tags ? [...task.tags] : [];
                        const newTagsArray = tagsArray.filter(t => t.toString() !== id);
                        return { ...task, tags: newTagsArray };
                    })
                );
                const storageKeys = Object.keys(localStorage).filter(key => key.startsWith("taskOrder_tag_"));
                storageKeys.forEach(key => {
                    const tagIdsInKey = key.replace("taskOrder_tag_", "").split("_").map(Number);
                    if (tagIdsInKey.includes(id)) {
                        localStorage.removeItem(key);
                    }
                });


                onSuccess("Tag successfully deleted!");
            } else if (type === "interval") {
                if (id.startTsId) await deleteTimestamp(id.startTsId);
                if (id.endTsId) await deleteTimestamp(id.endTsId);
                setTimestamps(prev => prev.filter(ts => ts._id !== id.startTsId && ts._id !== id.endTsId));
                onSuccess("Interval successfully deleted!");
            }
            onClose()
        } catch (error) {
            onError(`Failed to delete ${type}!`);
        }
    }

    return (
        <div
            className="h-auto rounded-lg bg-white p-6 flex flex-col items-start gap-5"
        >
            <div className="flex flex-row items-center gap-3">
                <button className='p-3 rounded-full border-red-300 text-red-500 border-2 bg-red-200'>
                    <TriangleAlert size={18} />
                </button>
                <div className="">
                    <p className='text-black text-lg'>{message}</p>
                    <p className='text-neutral-500 text-sm'>
                        {subMessage}
                    </p>
                </div>
            </div>

            <div className="self-end flex items-center gap-2">
                <button
                    onClick={(e) => { e.preventDefault(); onClose(); }}
                    className="cursor-pointer px-5 py-2 border-1 border-neutral-400 text-black rounded-lg font-medium bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                    Cancel
                </button>

                <button
                    onClick={handleDelete}
                    className="cursor-pointer px-5 py-2 border-1 border-red-500 bg-red-500 hover:bg-red-400 text-white rounded-lg font-medium transition-colors"
                >
                    Delete
                </button>
            </div>
        </div>
    )
}

export default DeleteDialog