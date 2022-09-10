"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */


/** Show main list of all stories when click site name */
function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);


/** Show login/signup on click on "login" */
function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);


/** Profile Click */
function navProfileClick() {
  hidePageComponents();
  $userProfile.show();
  
}

$navUserProfile.on("click", navProfileClick);


/** When a user first logins in, update the navbar to reflect that. */
function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-submit-favs-stories").show();
  $navLogin.hide();
  $navLogOut.show();

  // hide the login and signup form
  $loginForm.hide();
  $signupForm.hide();

  $navUserProfile.text(currentUser.username).show();
}


/** Show new story submit form when Submit is clicked on the nav bar */
function submitNewStoryClick(){
  hidePageComponents();
  $allStoriesList.show();
  $submitForm.show();
}

$navSubmitStory.on("click", submitNewStoryClick);


/** Show list of favorited stories when "favorites" is clicked on */
function favoritesClick(){
  hidePageComponents();
  putFavoritedStoriesOnPage();
}

$("#nav-favorite-story").on("click", favoritesClick);


/** Show user stories that they posted when clicking on "my stories" */
function userStoriesClick(){
  hidePageComponents();
  putUserStoriesOnPage();
  $ownStories.show();
}

$("#nav-my-stories").on("click", userStoriesClick);