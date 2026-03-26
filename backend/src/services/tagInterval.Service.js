import { totalTimeActiveForEachTag } from "./timestampByPeriod.Service.js"
import { getTagsCachedByMultipleIds } from "./cache/tagCache.Service.js"

// Aggregate tags with total active time and number of tasks for a given period
export const getTagsOfInterest = async ({start, end}) => {
    const { tagTotals, numberOfTasks } = await totalTimeActiveForEachTag({startTime: start, endTime: end});
    const tagIds = Object.keys(tagTotals);

    const tags = await getTagsCachedByMultipleIds([...tagIds]);
    const tagsWithActiveTimes = tags.map((tag) => ({
        ...tag,
        activeTime: tagTotals[tag._id.toString()] || 0,
        numberOfTasks: numberOfTasks[tag._id.toString()] || 0,
    }));

    return tagsWithActiveTimes;
}
