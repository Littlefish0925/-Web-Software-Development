  import {
    getSignedCookie,
    setSignedCookie,
  } from "https://deno.land/x/hono@v3.12.11/helper.ts";
  import * as courseService from "./courseService.js";
  
  const secret = "feedback-secret";
  
  const handleFeedback = async (c) => {
    const courseId = c.req.param("courseId");
    const feedbackValue = c.req.param("value");
  
    let userFeedbackCookie = await getSignedCookie(c, "userFeedback", secret) || {};
    console.log("Existing Feedback Cookie:", JSON.stringify(userFeedbackCookie));
  
    if (userFeedbackCookie[courseId]) {
      console.log(`Feedback already given for course ${courseId}`);
      return c.redirect("/courses");
    }
  
    const currentCount = await courseService.getFeedbackCount(courseId, feedbackValue);
    console.log(`Current count for course ${courseId}, value ${feedbackValue}: ${currentCount}`);
    
    await courseService.addFeedback(courseId, feedbackValue);
  
    const updatedCount = await courseService.getFeedbackCount(courseId, feedbackValue);
    console.log(`Updated count for course ${courseId}, value ${feedbackValue}: ${updatedCount}`);
  
    userFeedbackCookie[courseId] = true;
    console.log("Updated Feedback Cookie:", JSON.stringify(userFeedbackCookie));
  
    await setSignedCookie(c, "userFeedback", userFeedbackCookie, secret, {
      path: "/courses",
    });
  
    return c.redirect("/courses");
  };
  
  export { handleFeedback };
  