import { Eta } from "https://deno.land/x/eta@v3.4.0/src/index.ts";
import * as courseService from "./courseService.js";
import {
  getSignedCookie,
  setSignedCookie,
} from "https://deno.land/x/hono@v3.12.11/helper.ts";

const eta = new Eta({ views: `${Deno.cwd()}/templates/` });
const secret = "feedback-secret";

const listCourses = async (c) => {
  const courses = await courseService.listCourses();
  return c.html(eta.render("courses.eta", { courses, error: null, currentName: null }));
};

const addCourse = async (c) => {
  const body = await c.req.parseBody();
  const courseName = body.name;

  if (!courseName || courseName.length < 4) {
    const courses = await courseService.listCourses();
    return c.html(
      eta.render("courses.eta", {
        courses,
        error: "The course name should be a string of at least 4 characters.",
        currentName: courseName,
      })
    );
  }

  await courseService.addCourse(courseName);
  return c.redirect("/courses");
};

const showCourse = async (c) => {
  const courseId = c.req.param("courseId");
  const course = await courseService.getCourse(courseId);

  const userFeedbackCookie = (await getSignedCookie(c, secret, "userFeedback")) || {};
  const feedbackGiven = userFeedbackCookie[courseId] || false;

  const feedbackCounts = {};
  for (let i = 1; i <= 5; i++) {
    feedbackCounts[i] = await courseService.getFeedbackCount(courseId, i);
  }

  return c.html(
    eta.render("course.eta", { course, feedbackCounts, feedbackGiven })
  );
};

const deleteCourse = async (c) => {
  const courseId = c.req.param("courseId");
  await courseService.deleteCourse(courseId);
  return c.redirect("/courses");
};

const handleFeedback = async (c) => {
  const courseId = c.req.param("courseId");
  const feedbackValue = c.req.param("value");

  // Retrieve the signed cookie and ensure it's parsed into an object
  let userFeedbackCookie = (await getSignedCookie(c, secret, "userFeedback")) || "{}";
  if (typeof userFeedbackCookie === "string") {
    userFeedbackCookie = JSON.parse(userFeedbackCookie);
  }

  // Check if feedback already given
  if (userFeedbackCookie[courseId]) {
    return c.redirect(`/courses/${courseId}`);
  }

  // Add feedback and update the cookie
  await courseService.addFeedback(courseId, feedbackValue);
  userFeedbackCookie[courseId] = true;

  // Set the updated cookie
  await setSignedCookie(c, "userFeedback", JSON.stringify(userFeedbackCookie), secret, {
    path: "/",
  });

  return c.redirect(`/courses/${courseId}`);
};


const getFeedbackCount = async (c) => {
  const courseId = c.req.param("courseId");
  const feedbackValue = c.req.param("value");
  const count = await courseService.getFeedbackCount(courseId, feedbackValue);
  return c.text(`Feedback ${feedbackValue}: ${count}`);
};

export {
  listCourses,
  addCourse,
  showCourse,
  deleteCourse,
  handleFeedback,
  getFeedbackCount,
};
