export const normalizeTaskId = (tasks) => {
  return tasks.map((task) => ({
    ...task,
    id: task._id,
  }));
};
