import { Hono } from "https://deno.land/x/hono@v3.12.11/mod.ts";
import * as courseController from "./courseController.js";

const app = new Hono();

app.get("/courses", courseController.listCourses);
app.post("/courses", courseController.addCourse);
app.get("/courses/:courseId", courseController.showCourse);
app.post("/courses/:courseId/delete", courseController.deleteCourse);
app.post("/courses/:courseId/feedbacks/:value", courseController.handleFeedback);
app.get("/courses/:courseId/feedbacks/:value", courseController.getFeedbackCount);

export default app;
