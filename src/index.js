import SpotifyWebApi from 'spotify-web-api-node';
import _ from 'highland';

import credentials from '../secrets/credentials';

// credentials are optional
const spotifyApi = new SpotifyWebApi(credentials);

// Retrieve an access token.
const playlist = spotifyApi.clientCredentialsGrant()
  .then((data) => { spotifyApi.setAccessToken(data.body['access_token']); })
  .then(() => spotifyApi.getPlaylist('musicforants', '0B2xvQtyS1v9wTPoPyJaco'));

_(playlist)
  .pluck('body')
  .pluck('tracks')
  .pluck('items')
  .flatten()
  .pluck('track')
  .flatMap(({ id, name, album, artists }) => _(spotifyApi.getAlbum(album.id))
    .pluck('body')
    .filter(({ release_date }) => new Date(release_date).getFullYear() === new Date().getFullYear())
    .map((data) => ({
      id,
      name,
      albumName: data.name,
      artist: artists[0].name
    })))
  .toArray((x) => { console.log(x); })
