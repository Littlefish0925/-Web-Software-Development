const kv = await Deno.openKv();

export const incrementFeedback = async (value) => {
  const key = ["feedback", value.toString()];
  const res = await kv.get(key);
  const count = res.value ? res.value + 1 : 1;
  await kv.set(key, count);
};

export const getFeedbackCount = async (value) => {
  const key = ["feedback", value.toString()];
  const res = await kv.get(key);
  return res.value || 0;
};