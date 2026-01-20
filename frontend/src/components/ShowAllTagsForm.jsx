import React, { useContext, useState } from 'react'
import { TasksAndTagsContext } from '../context/TasksAndTagsContext';
import { Tag, Ellipsis, SquarePen, Trash } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import EditTagForm from './EditTagForm';
import DeleteDialog from './DeleteDialog';
const ShowAllTagsForm = ({ onClose, onSuccess, onError }) => {


    const [editTagId, setEditTagId] = useState(null)
    const [deleteTagId, setDeleteTagId] = useState(null)

    const { tags, setTags } = useContext(TasksAndTagsContext);

    return (
        <div
            className="h-[60vh] z-2000 overflow-y-scroll flex flex-col rounded-lg bg-neutral-900 p-6 xs:p-8 xs:py-10 gap-5"
        >
            {tags.map(tag => (
                <div key={tag._id} className="relative min-h-[80px] max-h-[100px] flex-none w-full overflow-y-auto bg-neutral-800 flex flex-row gap-3 items-start justify-between rounded-lg px-3 py-2">
                    <div className="flex flex-col items-start h-full gap-3">
                        <span className="px-3 py-1 w-fit whitespace-nowrap bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-teal-300 border border-emerald-500/30 rounded-full text-sm font-medium flex items-center gap-1 cursor-pointer">
                            <Tag size={14} />
                            <p className='ml-1'>{tag.title}</p>
                        </span>
                        <div className={`text-sm ${tag.description ? 'text-white' : 'text-gray-400 italic'}`}>{tag.description || "No description"}</div>
                        <div className="absolute top-0 right-0">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="cursor-pointer p-2 bg-transparent hover:bg-neutral-700 text-white text-sm rounded-md">
                                        <Ellipsis />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className='z-1000' side="bottom" align="end" >
                                    <DropdownMenuItem onSelect={() => setEditTagId(tag._id)} className='text-black data-[highlighted]:bg-gradient-to-r from-cyan-500 to-blue-500 data-[highlighted]:text-white cursor-pointer'>
                                        <SquarePen className='focus:text-white' />
                                        <p className='text-sm'>Edit</p>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setDeleteTagId(tag._id)} className="text-black data-[highlighted]:bg-gradient-to-br from-red-600 via-red-500 to-yellow-200 data-[highlighted]:text-white  cursor-pointer">
                                        <Trash className="focus:text-white" />
                                        <p className="text-sm">Delete</p>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>



                </div>
            ))}
            <div className="self-end translate-x-4 flex gap-3">
                {/* Submit Button */}
                <button
                    type="submit"
                    onClick={(e) => { e.preventDefault(); onClose(); }}
                    className="mt-8 cursor-pointer px-5 py-2 bg-white text-black rounded-lg font-medium hover:bg-neutral-300 transition-all"
                >
                    Confirm
                </button>
            </div>

            {/* ----- Edit Tag Form ----- */}
            {editTagId &&
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-1000">
                    <div className="bg-neutral-900 px-6 py-3 md:p-3 rounded-2xl shadow-lg w-[90%] md:w-[500px] relative">
                        <EditTagForm
                            onClose={() => setEditTagId(null)}
                            onSuccess={onSuccess}
                            onError={onError}
                            tagId={editTagId}
                        />
                    </div>
                </div>
            }

            {/* ----- Open/close deleteTag modal dialogs ----- */}
            {deleteTagId && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-1000">
                    <div className="bg-neutral-900 px-6 py-3 md:p-3 rounded-2xl shadow-lg w-[90%] xs:w-[70%] md:w-[500px] relative">
                        <DeleteDialog
                            type="tag"
                            onClose={() => setDeleteTagId(null)}
                            onSuccess={onSuccess}
                            onError={onError}
                            id={deleteTagId}
                            message="Delete Tag"
                            subMessage="Are you sure you want to delete this tag?"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default ShowAllTagsForm
