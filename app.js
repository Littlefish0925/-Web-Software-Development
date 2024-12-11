import { Hono } from "https://deno.land/x/hono@v3.12.11/mod.ts";
import { Eta } from "https://deno.land/x/eta@v3.4.0/src/index.ts";
import { incrementFeedback, getFeedbackCount } from "./feedbacks.js";

const eta = new Eta({ views: `${Deno.cwd()}/templates/` });
const app = new Hono();

app.get("/", async (c) => {
  const html = await eta.render("index.eta");
  return c.html(html);
});

app.post("/feedbacks/:value", async (c) => {
  const value = c.req.param("value");
  await incrementFeedback(value);
  return c.redirect("/");
});

app.get("/feedbacks/:value", async (c) => {
  const value = c.req.param("value");
  const count = await getFeedbackCount(value);
  return c.text(`Feedback ${value}: ${count}`);
});

export default app;
