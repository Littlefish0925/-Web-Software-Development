const kv = await Deno.openKv();

const listCourses = async () => {
  const courses = [];
  for await (const entry of kv.list({ prefix: ["courses"] })) {
    courses.push(entry.value);
  }
  return courses;
};

const addCourse = async (name) => {
  const id = crypto.randomUUID();
  const course = { id, name };
  await kv.set(["courses", id], course);
};

const getCourse = async (id) => {
  const entry = await kv.get(["courses", id]);
  return entry?.value ?? null;
};

const deleteCourse = async (id) => {
  await kv.delete(["courses", id]);
  for (let i = 1; i <= 5; i++) {
    await kv.delete(["feedback", id, `${i}`]);
  }
};

const addFeedback = async (courseId, value, userFeedbackCookie) => {
  const key = ["feedback", courseId, value];
  const entry = await kv.get(key);
  const currentCount = entry?.value ?? 0;

  const newCount = currentCount + 1;
  await kv.set(key, newCount);

  // Update counts in cookies
  userFeedbackCookie[courseId] = userFeedbackCookie[courseId] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  userFeedbackCookie[courseId][value] = newCount;

  console.log(`Updated count for course ${courseId}, value ${value}: ${newCount}`);
};

const getFeedbackCount = async (courseId, value, userFeedbackCookie) => {
  const key = ["feedback", courseId, value];
  const entry = await kv.get(key);
  const count = entry?.value ?? 0;

  // Synchronize back to cookies if needed
  userFeedbackCookie[courseId] = userFeedbackCookie[courseId] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  userFeedbackCookie[courseId][value] = count;

  console.log(`Fetched count for course ${courseId}, value ${value}: ${count}`);
  return count;
};


export {
  listCourses,
  addCourse,
  getCourse,
  deleteCourse,
  addFeedback,
  getFeedbackCount,
};
