import { useState, useContext, useEffect } from 'react'
import { Tag, ArrowUpDown, Filter, CircleFadingPlus, Delete } from 'lucide-react'
import TaskElement_card from '../components/TaskElement_card'
import AddTaskAndTagForm from '../components/AddTaskAndTagForm'
import { TasksAndTagsContext } from '../context/TasksAndTagsContext'
import Alert from '../components/Alert'
import ShowAllTagsForm from '../components/ShowAllTagsForm'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { SettingsContext } from '../context/SettingsContext'

const Dashboard = () => {

    const { theme } = useContext(SettingsContext);

    const bgClass = theme === 'dark' 
    ? 'bg-neutral-900' 
    : '';

    const neon = {
        timer: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400',
        button: 'from-purple-500 to-cyan-500',
        buttonInactive: 'bg-gradient-to-r from-purple-900/30 to-cyan-900/30',
        glow: 'bg-gradient-to-r from-purple-400 to-cyan-400',
        tag: 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-300 border border-purple-500/30',
        accent: 'bg-gradient-to-b from-purple-400 to-cyan-400'
    }

    const { tasks, tags, setTasks, setTags, fetchData, timestamps, setTimestamps } = useContext(TasksAndTagsContext)

    // Open create task/tag form
    const [openCreateNewForm, setOpenCreateNewForm] = useState(false);

    // Open all tags form for edit/delete
    const [openShowAllTagsForm, setOpenShowAllTagsForm] = useState(false);

    const [selectedTagsFilter, setSelectedTagsFilter] = useState([]);

    const [tasksByTagsFilter, setTasksByTagsFilter] = useState([]);

    // Sort by time
    const [sortOrder, setSortOrder] = useState(null);


    useEffect(() => {
        if (selectedTagsFilter.length === 0) {
            setTasksByTagsFilter(tasks);
            return;
        }
        const filteredTasks = tasks.filter(task => {
            const tagsArray = task.tags || [];
            return tagsArray.some(tagId => selectedTagsFilter.some(tag => tag._id === tagId))
        })

        setTasksByTagsFilter(filteredTasks)
    }, [selectedTagsFilter, tasks])

    const handleSortChange = (order) => {
        setSortOrder(prev => (prev === order ? null : order));
    };


    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const onSuccess = (message) => setNotification({ show: true, message, type: 'success' });
    const onError = (message) => setNotification({ show: true, message, type: 'error' });



    return (
        <div className={`${bgClass} text-white p-6 xs:p-8 rounded-lg h-full overflow-y-auto`}>

            {/* ----- Active time trackers ----- */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-7 bg-gradient-to-b from-purple-400 via-blue-400 to-cyan-400 rounded-full"></div>
                    <div className="flex flex-col">
                        <p className='text-lg xs:text-2xl font-semibold bg-gradient-to-r from-lime-100 via-cyan-500 to-blue-400 bg-clip-text text-transparent'>Active Time Trackers</p>
                        <p className='text-sm text-neutral-500'>Track every second. Master your time.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => setOpenCreateNewForm(true)} className='inline-flex px-2 py-2 xs:px-4 xs:py-5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl xs:rounded-xl items-center gap-0 xs:gap-2 hover:from-purple-600 hover:to-blue-600 transition-colors duration-300 shadow-lg shadow-purple-500/30 font-medium cursor-pointer'>
                        <span className="max-xs:hidden xs:text-base">New Task  /  Tag</span>
                        <CircleFadingPlus className=" w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* ----- View control ----- */}
            <div className="flex flex-col xs:flex-row xs:items-center mb-6 gap-3">
                {/* ----- Dashboard title ----- */}
                <div className="mb-6">
                    <p className="text-2xl md:text-3xl font-medium text-white">
                        Dashboard{' '}
                        <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Overview
                        </span>
                    </p>
                    <p className="text-neutral-500 text-sm mt-1">
                        Track your daily activity and monitor task performance at a glance.
                    </p>
                </div>

                <div className="flex flex-row gap-3 xs:ml-auto w-full xs:w-auto">
                    {/* Sort + Filter */}
                    <div className="flex flex-row gap-3 w-full xs:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className='px-3 xs:px-5 py-2 bg-neutral-700 rounded-lg flex items-center justify-center gap-1 hover:bg-neutral-600 transition-colors duration-300 cursor-pointer'>
                                    <ArrowUpDown size={15} />
                                    <span className="text-sm xs:text-sm md:text-base">Sort</span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="bottom" align="start" className="max-h-[200px] mt-3 flex max-w-[200px] flex-wrap">
                                <DropdownMenuCheckboxItem
                                    onSelect={(e) => e.preventDefault()}
                                    checked={sortOrder === "Earliest"}
                                    onCheckedChange={() => handleSortChange("Earliest")}
                                    className="cursor-pointer w-full"
                                >
                                    Earliest
                                </DropdownMenuCheckboxItem>

                                <DropdownMenuCheckboxItem
                                    onSelect={(e) => e.preventDefault()}
                                    checked={sortOrder === "Latest"}
                                    onCheckedChange={() => handleSortChange("Latest")}
                                    className="cursor-pointer w-full"
                                >
                                    Latest
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    onSelect={(e) => e.preventDefault()}
                                    checked={sortOrder === "Default"}
                                    onCheckedChange={() => handleSortChange("Default")}
                                    className="cursor-pointer w-full"
                                >
                                    Default
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className='px-3 xs:px-5 py-2 bg-neutral-700 rounded-lg flex items-center justify-center gap-1 hover:bg-neutral-600 transition-colors duration-300 cursor-pointer'>
                                    <Filter size={15} />
                                    <span className="text-sm xs:text-sm md:text-base">Filter</span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="bottom" align="start" className="max-h-[200px] mt-3 flex max-w-[200px] flex-wrap">
                                {tags.map(tag => (
                                    <DropdownMenuCheckboxItem
                                        key={tag._id}
                                        onSelect={(e) => e.preventDefault()}
                                        checked={selectedTagsFilter.some(t => t._id === tag._id)}
                                        onCheckedChange={(isNowChecked) => {
                                            if (isNowChecked) {
                                                setSelectedTagsFilter([...selectedTagsFilter, tag])
                                            } else {
                                                setSelectedTagsFilter(selectedTagsFilter.filter(t => t._id !== tag._id))
                                            }
                                        }}
                                        className="cursor-pointer w-full"
                                    >
                                        {tag.title.charAt(0).toUpperCase() + tag.title.slice(1)}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>


                    </div>
                    {/* All tags */}
                    <button onClick={() => setOpenShowAllTagsForm(true)} className='px-3 w-[150px] xs:w-auto xs:px-5 py-3 bg-gradient-to-br from-green-400 to-blue-600 hover:from-green-500 hover:to-blue-700 rounded-lg flex items-center justify-center gap-1 transition-colors duration-300 cursor-pointer'>
                        <Tag size={15} />
                        <span className="text-sm xs:text-sm md:text-base">Tags</span>
                    </button>
                </div>
            </div>

            {/* ----- Filter tags display ----- */}
            {
                selectedTagsFilter.length > 0 && selectedTagsFilter && (
                    <div className="flex flex-row w-full my-5 gap-2 flex-wrap">
                        {selectedTagsFilter.map(tag => (
                            <Tooltip key={tag._id}>
                                <TooltipTrigger asChild>
                                    <span className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-teal-300 border border-emerald-500/30 rounded-full text-sm font-medium flex items-center gap-1 cursor-pointer">
                                        <Tag size={14} />
                                        <p className="whitespace-nowrap flex-shrink-0">{tag.title}</p>
                                        <Delete onClick={() => setSelectedTagsFilter(selectedTagsFilter.filter(t => t._id !== tag._id))} className='text-neutral-500 w-5 h-5' />
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="bottom"
                                    align="start"
                                    className="inline-block max-w-xs bg-white text-black border border-gray-200 rounded-lg shadow-lg px-3 py-2"
                                >
                                    <p className="leading-relaxed flex-1">{tag.description || "No additional data"}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                )
            }



            {/* ----- Time tracker card ----- */}
            <TaskElement_card
                tasks={tasksByTagsFilter}
                tags={tags}
                timestamps={timestamps}
                setTimestamps={setTimestamps}
                colors={neon}
                selectedTagsFilter={selectedTagsFilter}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
            />




            {/* ----- Create new task/tag form ----- */}
            {
                openCreateNewForm && (
                    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-1000">
                        <div className="bg-neutral-900 px-6 py-3 md:p-3 rounded-2xl shadow-lg w-[90%] md:w-[500px] relative">
                            <AddTaskAndTagForm
                                onClose={() => setOpenCreateNewForm(false)}
                                onSuccess={onSuccess}
                                onError={onError} />
                        </div>
                    </div>
                )
            }

            {/* ----- Edit tags form----- */}
            {
                openShowAllTagsForm && (
                    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-1000">
                        <div className="bg-neutral-900 px-6 py-3 md:py-1 md:px-3 rounded-2xl shadow-lg w-[90%] md:w-[500px] relative">
                            <ShowAllTagsForm
                                onClose={() => setOpenShowAllTagsForm(false)}
                                onSuccess={onSuccess}
                                onError={onError} />
                        </div>
                    </div>
                )
            }

            {/* ----- Notification ----- */}
            {
                notification.show && (
                    <Alert
                        onClose={() => setNotification({ ...notification, show: false })}
                        message={notification.message}
                        type={notification.type}
                    />
                )
            }

        </div >
    )
}

export default Dashboard