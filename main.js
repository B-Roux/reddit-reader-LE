/*
 * Main entrypoint
 */

// URLs/APIs/etc.
const redditURL = "https://www.reddit.com";
const redditAPI = "https://api.reddit.com";

// Cache the URL parameters
const URLParams = new URLSearchParams(window.location.search);
const thisSubreddit = URLParams.has("subreddit") ? URLParams.get("subreddit") : "all";
const thisSort = URLParams.has("sort") ? URLParams.get("sort") : "hot";
const thisTime = URLParams.has("time") ? URLParams.get("time") : "all";
const thisAfter = URLParams.has("after") ? URLParams.get("after") : null;

// Main - to be run after the DOM is fully loaded
window.addEventListener('DOMContentLoaded', (_) => {
    // Load the requested information
    let url = makeSubredditJsonURL( // utils.js
        thisSubreddit,
        thisSort,
        thisTime,
        thisAfter
    );
    makeSubredditPage(url, document.querySelector("#generator-destination")); //ui.js
});
