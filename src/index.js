import SpotifyWebApi from 'spotify-web-api-node';
import _ from 'highland';
import op from 'object-path';

import credentials from '../secrets/credentials';

const spotifyApi = new SpotifyWebApi(credentials);

const playlist = spotifyApi.clientCredentialsGrant()
  .then((data) => { spotifyApi.setAccessToken(data.body['access_token']); })
  .then(() => spotifyApi.getPlaylist('thruttle', '7wNGCPkXD4Pwf7hXa2UHoM'));

_(playlist)
  .map((data) => op.get(data, 'body.tracks.items'))
  .flatten()
  .pluck('track')
  .flatMap(({ id, name, album, artists }) => _(spotifyApi.getAlbum(album.id))
    .pluck('body')
    .filter(({ release_date }) => new Date(release_date).getFullYear() === new Date().getFullYear())
    .map((data) => ({ id, name, album: data.name, artist: artists[0].name })))
  .each((x) => { console.log(x); })
