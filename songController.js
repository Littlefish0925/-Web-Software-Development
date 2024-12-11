import { addSong, getSongs } from './songService.js';

export const showFormAndSongs = async (c) => {
    const songs = getSongs();
    const html = await eta.renderFile('index.eta', { songs });
    return c.html(html);
};

export const addNewSong = async (c) => {
  const body = await c.req.parseBody();
  const name = body.name;
  const duration = parseInt(body.duration, 10);

  if (name && !isNaN(duration)) {
    addSong(name, duration);
  }

  return c.redirect('/');
};
