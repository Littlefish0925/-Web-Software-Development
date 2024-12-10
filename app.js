import { Hono } from "https://deno.land/x/hono@v3.12.11/mod.ts";
import { getFeedback, incrementFeedback } from "./feedbacks.js";

const app = new Hono();

const feedbackRoutes = [1, 2, 3];

feedbackRoutes.forEach((value) => {
  app.get(`/feedbacks/${value}`, async (c) => {
    const count = await getFeedback(value);
    return c.text(`Feedback ${value}: ${count}`);
  });

  app.post(`/feedbacks/${value}`, async (c) => {
    await incrementFeedback(value);
    const count = await getFeedback(value);
    return c.text(`Feedback ${value}: ${count}`);
  });
});

export default app;

