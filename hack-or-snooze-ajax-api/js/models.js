"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

// async function storiesTest() {
//   let res = await axios.get("https://hack-or-snooze-v3.herokuapp.com/stories")
  
//   let allUrls = res.data.stories.map((result) => {
//     return result.url;
//   })
  
//   console.log(res);
//   console.log(allUrls);
// }

// async function signUpTest(){

//   let params = {
//     user: {
//       name: "testname1207",
//       username: "test1207",
//       password: "password1207",
//     },
//   };

//   const a = await axios.post(
//     "https://hack-or-snooze-v3.herokuapp.com/signup",
//     params
//   );
//     console.log(a);
// }


// async function loginTest(){
//   let params = {
//     user: {
//       username: "test1207",
//       password: "password1207",
//     },
//   };

//   const res = await axios.post("https://hack-or-snooze-v3.herokuapp.com/login",params);
//   console.log(res);
//   console.log(res.data.token);
// }


/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    // UNIMPLEMENTED: complete this function!
    // URL() will return a newly created URL object with several properties. 
    // host, hostname,href, pathname, are some of the properties that will be returned
    let link = new URL(this.url)
    return link.hostname;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

   static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });
    console.log(response);

    // OR you can write it like this
    //  const response = await axios.get(`${BASE_URL}/stories`);

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map((story) => new Story(story));
    console.log(stories);

    // build an instance of our own class using the new array of stories
    console.log(new StoryList(stories));
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, { author, title, url }) {
    // UNIMPLEMENTED: complete this function!
    const token = user.loginToken;
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "POST",
      data: { token, story: { author, title, url } },
    });

    // referring to data property on line 150, which is the data that will be used to create an instance of story
    let story = new Story(response.data.story);

    // unshift will add the new story to the beginning of the storylist array
    this.stories.unshift(story);

    // update the user's ownStories array
    user.ownStories.unshift(story);

    return story;
  }

  // delete story that user posted
  async removeStory(user, storyId) {
    const token = user.loginToken;
    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      data: { token },
    });

    // filter out the Id we want to remove
    this.stories = this.stories.filter(story => story.storyId !== storyId);

    // remove story from favorites and ownStories as well
    user.favorites = user.favorites.filter(story => story.storyId !== storyId);
    user.ownStories = user.ownStories.filter(story => story.storyId !== storyId);
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor(
    { username, name, createdAt, favorites = [], ownStories = [] },
    token
  ) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map((s) => new Story(s));
    this.ownStories = ownStories.map((s) => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }


  // Add story to favorites
  async addToFavorites(story){
    this.favorites.push(story);

    // make post request to add story to favorites
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: "POST",
      data: { token: this.loginToken },
    });
  }


  // remove story from favorites
  async removeFromFavorites(story){
    this.favorites = this.favorites.filter(favorite => favorite.storyId !== story.storyId);

    // make delete request to remove story from favorites
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: "DELETE",
      data: { token: this.loginToken },
    });
  }


  // return true or false if the user favorite the story or not
  isFavorite(story) {
    return this.favorites.some(s => (s.storyId === story.storyId));
  }
};


