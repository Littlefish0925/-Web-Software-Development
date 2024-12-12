let songs = [];

export const addSong = (name, duration) => {
  songs.push({ name, duration });
};

export const getSongs = () => {
  return songs;
};