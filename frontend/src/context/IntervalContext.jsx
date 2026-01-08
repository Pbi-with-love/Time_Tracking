import { createContext, useState } from "react";

export const IntervalContext = createContext();

const IntervalContextProvider = ({ children }) => {

    const getTodayIntervalFinland = () => {
        const now = new Date();

        const formatLocalDateTime = (date) => {
            const options = {
                timeZone: "Europe/Helsinki",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            };
            const parts = new Intl.DateTimeFormat("en-CA", options).formatToParts(date);
            const values = Object.fromEntries(parts.map(p => [p.type, p.value]));
            return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}`;
        };

        const start = new Date(now);
        start.setHours(0, 0, 0, 0);

        return {
            start: formatLocalDateTime(start),
            end: formatLocalDateTime(now),
        };
    };

    const getBarChartIntervalFinland = () => {
        const now = new Date();

        const formatLocalDate = (date) => {
            const options = {
                timeZone: "Europe/Helsinki",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            };
            const parts = new Intl.DateTimeFormat("en-CA", options).formatToParts(date);
            const values = Object.fromEntries(parts.map(p => [p.type, p.value]));
            return `${values.year}-${values.month}-${values.day}`;
        };

        const start = new Date(now);
        start.setDate(start.getDate() - 1);

        return {
            start: formatLocalDate(start),
            end: formatLocalDate(now),
        };
    };


    const [taskInterval, setTaskInterval] = useState(getTodayIntervalFinland());
    const [tagInterval, setTagInterval] = useState(getTodayIntervalFinland());
    const [taskActivityInterval, setTaskActivityInterval] = useState(getTodayIntervalFinland());
    const [dateBarChart, setDateBarChart] = useState(getBarChartIntervalFinland());

    const [totalTimeForInterestTasks, setTotalTimeForInterestTasks] = useState(0);
    const [totalTimeForInterestTags, setTotalTimeForInterestTags] = useState(0);



    const value = {
        taskInterval, setTaskInterval,
        tagInterval, setTagInterval,
        totalTimeForInterestTasks, setTotalTimeForInterestTasks,
        totalTimeForInterestTags, setTotalTimeForInterestTags,
        taskActivityInterval, setTaskActivityInterval,
        dateBarChart, setDateBarChart,
    };

    return (
        <IntervalContext.Provider value={value}>
            {children}
        </IntervalContext.Provider>
    )
}

export default IntervalContextProvider;