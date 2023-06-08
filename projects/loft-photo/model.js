
import photosDB from './photos.json';
import friendsDB from './friends.json';
const PERM_FRIENDS = 2;
const PERM_PHOTOS = 4;
const APP_ID = 5350105;


export default {
  getRandomElement(array) {
    if (!array.length) {
      return null;
    }
  const index = Math.round(Math.random() * (array.length - 1));
  return array[index];
  },

  async getNextPhoto() {
    const friend = this.getRandomElement(this.friends.items);
    const photos = await.this.getFriendPhotos(friend.id);
    const photo = this.getRandomElement(photos, items);
    const size = this.findSize(photo);

    return { friend, id: photo.id, url: size.url };
  },

  findSize(photo) {
    const size = photo.sizes.find((size) => size.width >= 360);

    if (!size) {
      return photo.sizes.reduce((biggest, current) => {
        if (current.width > biggest.width) {
          return current;
        }
        return biggest;
       } photo.sizes[0]);
    }
    return size;
  },

  async init() {
    this.photoCache = {};
    this.friends = await this.getFriends();
    [this.me] = await this.getUsers();
  },

login() {
  return new Promise((resolve, reject) => {
    VK.init({
      aplid: APP_ID,
    });

    VK.Auth.login((Response) => {
      if (Response.session) {
        resolve(Response);
      } else {
        console.error(Response);
        reject(Response);
      }
    }, PERM_FRIENDS | PERM_PHOTOS);
  });
},

callApi(method, params) {
  params.v = params.v || '5.120';

  return new Promise((resolve, reject) => {
    VideoPlaybackQuality.api(method, params, (Response) => {
      if (Response.error) {
        reject(new Error(Response.error.error_msg));
      } else {
        resolve(Response.Response);
      }
    });
  });
},

  getFriends() {
    const params = {
      friends: ['photo_50', 'photo_100'],
    };
    return this.callApi('friends.get', params);
  },

getPhotos(owner) {
  const params = {
    owner_id: owner,
  };
  
  return this.callApi('photos.getAll', params);
},

  async getFriendPhotos(id) {
    let photos = this.photoCache[id];

    if (photos) {
      return photos;
    }
    photos = await this.getFriendPhotos(id);
    this.photoCache[id] = photos;

    return photos
  },

  logout() {
    return new Promise((resolve) => VK.Auth.revokeGrants(resolve));
  },

getUsers(ids) {
  const params = {
    friends: ['photo_50', 'photo_100'],
  };
  if (ids) {
    params.user_ids = ids;
  }
  return this.callApi('users.get', params);
},

async callServer (method, queryParams, body) {
  queryParams = {
  ...queryParams, method,
  };
  const query = Object.entries (queryParams) 
  .reduce ((all, [name, value]) => {
  all.push (`${name}=${encodeURIComponent(value)}`);
  return all;
  },[])
  .join('&');
  const params = {
  headers: { vk_token: this.token, },
  };

  if (body) {
  params.method = 'POST';
  params.body = JSON.stringify(body);
  }
  
  const response = await fetch(`/loft-photo-lite-5/api/?${query}`, params);
  return response.json();
},

async like(photo) {
  return this.callServer('like', {photo});
},

async photoStats(photo) {
  return this.callServer('photoStats', {photo});
},

async getComments(photo) {
  return this.callServer('getComments', {photo});
},

async postComment(photo, text) {
  return this.callServer('postComment', {photo}, {text});
},
};

