let kv;

const initKV = async () => {
  if (!kv) {
    kv = await Deno.openKv();
  }
};

const getFeedback = async (value) => {
  await initKV();
  const result = await kv.get(["feedback", `${value}`]);
  return result.value || 0;
};

const incrementFeedback = async (value) => {
  await initKV();
  const currentCount = await getFeedback(value);
  await kv.set(["feedback", `${value}`], currentCount + 1);
};

export { getFeedback, incrementFeedback };
