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

const addFeedback = async (courseId, value) => {
  const key = ["feedback", courseId, value];
  const entry = await kv.get(key);
  const count = entry?.value ?? 0;
  await kv.set(key, count + 1);
};

const getFeedbackCount = async (courseId, value) => {
  const key = ["feedback", courseId, value];
  const entry = await kv.get(key);
  return entry?.value ?? 0;
};

export {
  listCourses,
  addCourse,
  getCourse,
  deleteCourse,
  addFeedback,
  getFeedbackCount,
};
