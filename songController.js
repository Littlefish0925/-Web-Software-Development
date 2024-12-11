import { addSong, getSongs } from './songService.js';

export const showFormAndSongs = (c) => {
  const songs = getSongs();
  return c.html(c.render('index.eta', { songs }));
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