import { Hono } from "https://deno.land/x/hono@v3.12.11/mod.ts";
import { Eta } from "https://deno.land/x/eta@v3.4.0/src/index.ts";
import { getSignedCookie, setSignedCookie } from "https://deno.land/x/hono@v3.12.11/helper.ts";
import * as courseService from "./courseService.js";

const app = new Hono();
const eta = new Eta({ views: `${Deno.cwd()}/templates/` });
const secret = "feedback-secret";

app.get("/courses", async (c) => {
  const courses = await courseService.listCourses();
  return c.html(eta.render("courses.eta", { courses }));
});

app.post("/courses", async (c) => {
  const body = await c.req.parseBody();
  await courseService.addCourse(body.name);
  return c.redirect("/courses");
});

app.get("/courses/:courseId", async (c) => {
  const courseId = c.req.param("courseId");
  const course = await courseService.getCourse(courseId);

  let userFeedbackCookie = await getSignedCookie(c, secret, "userFeedback") || "{}";
  try {
    userFeedbackCookie = JSON.parse(userFeedbackCookie);
  } catch (error) {
    userFeedbackCookie = {};
  }

  const feedbackGiven = userFeedbackCookie[courseId]?.given || false;

  // Retrieve feedback counts from the cookie or initialize them
  let feedbackCountsCookie = await getSignedCookie(c, secret, "feedbackCounts") || "{}";
  try {
    feedbackCountsCookie = JSON.parse(feedbackCountsCookie);
  } catch (error) {
    feedbackCountsCookie = {};
  }

  const feedbackCounts = feedbackCountsCookie[courseId] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return c.html(
    eta.render("course.eta", {
      course,
      feedbackCounts,
      feedbackGiven,
    })
  );
});

app.post("/courses/:courseId/feedbacks/:value", async (c) => {
  const courseId = c.req.param("courseId");
  const feedbackValue = c.req.param("value");

  let userFeedbackCookie = await getSignedCookie(c, secret, "userFeedback") || "{}";
  let feedbackCountsCookie = await getSignedCookie(c, secret, "feedbackCounts") || "{}";

  try {
    userFeedbackCookie = JSON.parse(userFeedbackCookie);
  } catch (error) {
    userFeedbackCookie = {};
  }

  try {
    feedbackCountsCookie = JSON.parse(feedbackCountsCookie);
  } catch (error) {
    feedbackCountsCookie = {};
  }

  if (userFeedbackCookie[courseId]?.given) {
    return c.redirect(`/courses/${courseId}`);
  }

  // Update feedback counts
  feedbackCountsCookie[courseId] = feedbackCountsCookie[courseId] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  feedbackCountsCookie[courseId][feedbackValue] = (feedbackCountsCookie[courseId][feedbackValue] || 0) + 1;

  // Update feedback given status
  userFeedbackCookie[courseId] = { given: true };

  // Store updated cookies
  await setSignedCookie(c, "feedbackCounts", JSON.stringify(feedbackCountsCookie), secret, {
    path: "/",
  });
  await setSignedCookie(c, "userFeedback", JSON.stringify(userFeedbackCookie), secret, {
    path: "/",
  });

  return c.redirect(`/courses/${courseId}`);
});

export default app;
