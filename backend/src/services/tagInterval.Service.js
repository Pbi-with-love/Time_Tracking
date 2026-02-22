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

// // Aggregate tags with total active time and number of tasks for a given period
// export const getTagsOfInterest = async ({ start, end }) => {
//   const tasks = await getTasksOfInterest({ start, end });
//   const allTags = await getAllTags();

//   const tagStatsMap = {};
//   tasks.forEach((task) => {
//     if (!task.tags) return;

//     const taskTagIds = task.tags
//       .split(',')
//       .map((s) => parseInt(s.trim(), 10))
//       .filter(Boolean);

//     taskTagIds.forEach((tagId) => {
//       if (!tagStatsMap[tagId]) {
//         tagStatsMap[tagId] = {
//           totalTime: 0,
//           taskIds: new Set(),
//         };
//       }
//       tagStatsMap[tagId].totalTime += task.activeTime || 0;
//       tagStatsMap[tagId].taskIds.add(task._id);
//     });
//   });

//   const tagsOfInterest = Object.entries(tagStatsMap)
//     .map(([tagIdStr, { totalTime, taskIds }]) => {
//       const tagId = parseInt(tagIdStr, 10);
//       const tagObj = allTags.find((t) => t._id === tagId);
//       if (!tagObj) return null;

//       return {
//         id: tagObj._id,
//         title: tagObj.title,
//         description: tagObj.description,
//         activeTime: totalTime,
//         numberOfTasks: taskIds.size,
//       };
//     })
//     .filter(Boolean);

//   return tagsOfInterest;
// };