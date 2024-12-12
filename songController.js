import { addSong, getSongs } from "./songService.js";

export function setupSongs(app, eta) {
  app.get("/", async (c) => {
    const songs = getSongs();
    const html = await eta.render("./templates/index.eta", { songs });
    return c.html(html);
  });

  app.post("/songs", async (c) => {
    const body = await c.req.parseBody();
    const name = body["name"];
    const duration = parseInt(body["duration"], 10);

    if (name && !isNaN(duration) && duration > 0) {
      addSong({ name, duration });
    }

    return c.redirect("/");
  });
}
