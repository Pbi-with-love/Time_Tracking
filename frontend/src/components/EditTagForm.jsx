import React, {useContext, useEffect, useState} from 'react'
import { getTagByID } from '../api/Tags';
import { updateTag } from '../api/Tags';
import { TasksAndTagsContext } from '../context/TasksAndTagsContext';
const EditTagForm = ({ onClose, onSuccess, onError, tagId }) => {

    const [tagName, setTagName] = useState("");
    const [tagDescription, setTagDescription] = useState("");
    const [originalTag, setOriginalTag] = useState(null)

    const { setTags } = useContext(TasksAndTagsContext);

    useEffect(() => {
        const fetchTag = async () => {
            const tag = await getTagByID(tagId);
            setTagName(tag.title);
            setTagDescription(tag.description);

            setOriginalTag(tag);
        }; fetchTag();
    }, [])

    const handleUpdateTag = async (e) => {
        e.preventDefault()

        if(tagName === originalTag.title && tagDescription === originalTag.description) {
            onError("No changes detected, tag was not updated!")
            onClose()
            return;
        }
        try {
            const updatedFields = {
                title: tagName,
                description: tagDescription
            }
            const updatedProcess = await updateTag(tagId, updatedFields)
            const updatedTag = await getTagByID(updatedProcess._id)
            setTags(prev => prev.map(t => t._id === updatedTag._id ? updatedTag : t))
            onSuccess("Tag successfully updated!")

            setTagName("")
            setTagDescription("")
            onClose()
        } catch (error) {
            onError("Failed to update tag!")
        }
    }
    

    return (
        <form
            onSubmit={handleUpdateTag}
            className="h-auto rounded-lg p-6 xs:p-8 flex flex-col items-start gap-5">
            {/* Tag Name */}
            <div className="flex w-full flex-col gap-1">
                <label
                    htmlFor="tag_title"
                    className="block mb-1 text-sm font-medium text-white"
                >
                    Tag title
                </label>
                <input
                    type="text"
                    id="tag_title"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    placeholder="Enter tag title"
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
                    Edit Tag
                </button>
            </div>
        </form>
    )
}

export default EditTagForm