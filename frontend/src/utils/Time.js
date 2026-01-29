export const calculateTotalTime = (tasks, timestamps) => {
  const results = {};
  tasks.forEach((task) => {
    const taskTimes = timestamps
      .filter((ts) => ts.task === task._id)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    let totalMs = 0;
    let startTime = null;

    taskTimes.forEach((ts) => {
      if (ts.type === "start") {
        startTime = new Date(ts.timestamp);
      } else if (ts.type === "end" && startTime) {
        totalMs += new Date(ts.timestamp) - startTime;
        startTime = null;
      }
    });

    results[task._id] = totalMs;
  });
  return results;
};

export const formattedTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedTime = `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return formattedTime;
};

export const formatTimestampForDB = (value) => {
  if (!value) return null;
  return new Date(value).toISOString(); // YYYY-MM-DDTHH:mm:ss.sssZ (UTC)
};

export const formatDateForInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  
  const pad = (n) => n.toString().padStart(2, "0");

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};