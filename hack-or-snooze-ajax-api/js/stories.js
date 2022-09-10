"use strict";

// This is the global list of the stories, an instance of StoryList
// storyList is an object, will have stories array, with story object; ie: stories = [story,story...]
let storyList;


/** Get and show stories when site first loads. */
async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  // if user is logged in, show which one is favorited
  // currentUser cannot be empty for the stars to show
  const showStar = Boolean(currentUser)

  return $(`
      <li id="${story.storyId}">
        ${showDeleteBtn ? addDeleteBtn() : ""}
        ${showStar ? addStar(story,currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

// Make delete button for the story
function addDeleteBtn() {
  return `
  <span class ="trash-can">
    <i class="fas fa-trash-alt"></i>
  </span>`;
}

// Make star button for each story; this will indicate which is favorite and which is not
function addStar(story, user) {
  const isFavorite = user.isFavorite(story);

  // fas isfiled star, far is just outline of the star
  const starType = isFavorite ? "fas" : "far";
  return `
  <span class="star">
    <i class= "${starType} fa-star"></i>
  </span>`;
}


/** Gets list of stories from global variable storyList, generates their HTML, and puts on page. */
function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}


/** Add new story callback function */ 
async function submitNewStory(evt){
  evt.preventDefault();

  // info from submit new story form
  const title = $("#new-story-title").val();
  const author = $("#author-name").val();
  const url = $("#new-story-url").val();
  const username = currentUser.username;

  const story = await storyList.addStory(currentUser, {title, author, url, username})

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $submitForm.hide();
  $submitForm.trigger("reset");
}

$submitForm.on("click", submitNewStory);


/** Display stories posted by user after clicking on "stories" on the nav bar */ 
async function putUserStoriesOnPage(){
  $ownStories.empty();

  if (currentUser.ownStories.length === 0) {
    $ownStories.append(
      "<h5>You Have Not Posted A Story Yet. Share One With Us!</h5>"
    );
  }
  else{
    for(let userStory of currentUser.ownStories){
      const $story = generateStoryMarkup(userStory, true);
      $ownStories.append($story);
    }
  }

  $ownStories.show();
}


/** Put Favorite Stories on Page */
function putFavoritedStoriesOnPage(){
  $favoritedStories.empty();
  if(currentUser.favorites.length === 0){
    $favoritedStories.append("<h5>Nothing Added Yet, Go Favorite Some Stories!")
  }
  else{
    for(let favStory of currentUser.favorites){
      const $story = generateStoryMarkup(favStory);
      $favoritedStories.append($story)
    }
  }

  $favoritedStories.show();
}


/** Favorite and Unfavorite a Story Click Event */

async function toggleFav(evt){
  const $clickedStory = $(evt.target)
  let storyId = $clickedStory.parents("li").attr("id");
  
  // this will look for the storyId in storyList that has the same storyId as the story that was clicked on
  const story = storyList.stories.find(s => s.storyId === storyId)

  if ($clickedStory.hasClass("fas")) {
    await currentUser.removeFromFavorites(story);
    $clickedStory.closest("i").toggleClass("fas far");
  } else {
    await currentUser.addToFavorites(story);
    $clickedStory.closest("i").toggleClass("far fas");
  }
}

$storiesLists.on("click", ".star", toggleFav);


/** Deleting a Story */

async function deleteStory(evt){
  const $clickedStory = $(evt.target);
  const storyId = $clickedStory.parents("li").attr("id");

  await storyList.removeStory(currentUser, storyId);
  await putUserStoriesOnPage();
}

$("#own-stories").on("click", ".fa-trash-alt", deleteStory);


