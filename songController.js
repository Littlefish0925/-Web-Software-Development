import { addSong, getSongs } from './songService.js';

export function setupSongs(app, eta) {
  app.get("/", async (c) => {
    try {
      const songs = getSongs();
      console.log("Rendering songs:", songs); // Debugging
      const html = await eta.render("index.eta", { songs });
      return c.html(html);
    } catch (error) {
      console.error("Error rendering template:", error); // Log detailed error
      return c.text("Internal Server Error", 500);
    }
  });

  app.post("/songs", async (c) => {
    try {
      const body = await c.req.parseBody();
      const name = body["name"];
      const duration = parseInt(body["duration"], 10);

      if (name && !isNaN(duration) && duration > 0) {
        addSong(name, duration);
        console.log("Song added:", { name, duration }); // Debugging
      } else {
        console.warn("Invalid song data:", body); // Debugging invalid input
      }

      return c.redirect("/");
    } catch (error) {
      console.error("Error processing form:", error); // Log detailed error
      return c.text("Internal Server Error", 500);
    }
  });
}
