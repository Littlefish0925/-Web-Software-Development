import { Eta } from "https://deno.land/x/eta@v3.4.0/src/index.ts";
import * as courseService from "./courseService.js";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const eta = new Eta({ views: `${Deno.cwd()}/templates/` });

const courseNameValidator = z.string().min(4, {
  message: "The course name should be a string of at least 4 characters.",
});

const listCourses = async (c) => {
  const courses = await courseService.listCourses();
  return c.html(
    eta.render("courses.eta", { courses, error: null, currentName: null }),
  );
};

const addCourse = async (c) => {
  const body = await c.req.parseBody();
  const courseName = body.name;

  const validationResult = courseNameValidator.safeParse(courseName);

  if (!validationResult.success) {
    const courses = await courseService.listCourses();
    return c.html(
      eta.render("courses.eta", {
        courses,
        error: validationResult.error.errors[0].message,
        currentName: courseName,
      }),
    );
  }

  await courseService.addCourse(courseName);
  return c.redirect("/courses");
};

const showCourse = async (c) => {
  const courseId = c.req.param("courseId");
  const course = await courseService.getCourse(courseId);

  const feedbackCounts = {};
  for (let i = 1; i <= 5; i++) {
    feedbackCounts[i] = await courseService.getFeedbackCount(courseId, i);
  }

  return c.html(
    eta.render("course.eta", { course, feedbackCounts }),
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
  await courseService.addFeedback(courseId, feedbackValue);
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
