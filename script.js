// URLs/APIs/etc.
const redditURL = "https://www.reddit.com/";
const redditAPI = "https://api.reddit.com/";
const readerURL = "file:///C:/Users/baren/source/repos/birddit/index.html/";

// Cache the URL parameters
const URLParams = new URLSearchParams(window.location.search);
const thisSubreddit = getURLParam("subreddit", "all");
const thisSort = getURLParam("sort", "hot");
const thisTime = getURLParam("time", "all");
const thisAfter = getURLParam("after", null);

//Global Variables

// Cached query
var subredditToFetch = thisSubreddit;
var sortToFetch = thisSort;
var timeToFetch = thisTime;

// Cached element refs
var timeSelectorRadio = null;
var generatorDestination = null;

// Main - to be run after the DOM is fully loaded
window.addEventListener('DOMContentLoaded', (event) => {
    // Bind UI elements
    timeSelectorRadio = document.querySelector("#time-selector-group");
    generatorDestination = document.querySelector("#generator-destination");

    // Initialize UI
    document.querySelector("#subreddit-name").value = thisSubreddit;
    document.querySelectorAll('.sort-selector').forEach((radioButton) => {
        radioButton.checked = radioButton.value == thisSort;
    });
    document.querySelectorAll('.time-selector').forEach((radioButton) => {
        radioButton.checked = radioButton.value == thisTime;
    });
    if (thisSort == "controversial" || thisSort == "top") {
        timeSelectorRadio.style.display = "inline";
    } else {
        timeSelectorRadio.style.display = "none";
    }

    // Load the requested information
    let url = makeSubredditJsonURL(
        thisSubreddit,
        thisSort,
        thisTime,
        getURLParam("after", null)
    );
    makeSubredditPage(url, generatorDestination);
});

// UI controls

// Caches the value entered into the subreddit textbox
function changeSubreddit(value) {
    subredditToFetch = value;
}

// Caches the value entered into the sort radio group
function changeSort(value) {
    if (value == "controversial" || value == "top") {
        timeSelectorRadio.style.display = "inline";
    } else {
        timeSelectorRadio.style.display = "none";
    }
    sortToFetch = value;
}

// Caches the value entered into the time period radio group
function changeTime(value) {
    timeToFetch = value;
}

// Navigates to a new reader page based on the cached query
function navigateToQueriedPage() {
    window.location.href = makeReaderSubredditURL(
        subredditToFetch,
        sortToFetch,
        timeToFetch,
        null
    );
}

// Functionality

// Make a URL that refers to a given query to the Reddit API
function makeSubredditJsonURL(subreddit, sort = "hot", time = "all", after = null) {
    let url = redditAPI + "r/" + subreddit + "/" + sort + "?raw_json=1"
    if (sort == "controversial" || sort == "top") {
        url += "&t=" + time;
    }
    if (after != null) {
        url += "&after=" + after;
    }
    return url;
}

// Make a URL that refers to a given query on this reader
function makeReaderSubredditURL(subreddit, sort = "hot", time = "all", after = null) {
    let url = readerURL + "?subreddit=" + subreddit + "&sort=" + sort;
    if (sort == "controversial" || sort == "top") {
        url += "&time=" + time;
    }
    if (after != null) {
        url += "&after=" + after;
    }
    return url;
}


// Reddit API interface

// Append a subreddit page to the destination HTML node
function makeSubredditPage(url, destination) {
    fetchJSON(url)
        .then(function (data) {
            data.data.children.forEach(child => {
                destination.appendChild(makePostNode(child.data));
            });

            let nextPage = document.createElement("a");
            nextPage.setAttribute("id", "next-page-link");
            nextPage.setAttribute("href", makeReaderSubredditURL(
                thisSubreddit,
                thisSort,
                thisTime,
                data.data.after
            ));
            nextPage.appendChild(document.createTextNode("next page"));
            destination.appendChild(nextPage);

        })
        .catch(function (err) {
            alert(err);
        });
}

// Make an HTML node of a single post
function makePostNode(post) {
    let container = document.createElement("div");
    container.setAttribute("class", "post-container");

    let left = document.createElement("div");
    left.setAttribute("class", "post-container-left");
    let right = document.createElement("div");
    right.setAttribute("class", "post-container-right");
    let bottom = document.createElement("div");
    bottom.setAttribute("class", "post-container-bottom");

    let score = document.createElement("div");
    score.setAttribute("class", "post-score");
    score.appendChild(document.createTextNode(post.score.toLocaleString()));
    left.appendChild(score);

    if (
        post.thumbnail == "self"
        || post.thumbnail == "spoiler"
        || post.thumbnail == "nsfw"
        || post.thumbnail == "default"
        || post.thumbnail == ""
    ) {
        let thumbnailContainer = document.createElement("div");
        thumbnailContainer.setAttribute(
            "class",
            "post-no-thumbnail no-thumbnail-type-" + post.thumbnail
        );
        left.appendChild(thumbnailContainer);
    } else {
        let thumbnailContainer = document.createElement("div");
        thumbnailContainer.setAttribute("class", "post-thumbnail");
        let thumbnail = document.createElement("img");
        thumbnail.setAttribute("src", post.thumbnail);
        thumbnail.setAttribute("draggable", "false");
        thumbnailContainer.appendChild(thumbnail);
        left.appendChild(thumbnailContainer);
    }

    let title = document.createElement("a");
    title.setAttribute("href", post.url);
    title.setAttribute("target", "_blank");
    if (post.stickied) {
        title.setAttribute("class", "post-title sticky-post");
    } else {
        title.setAttribute("class", "post-title");
    }
    title.appendChild(document.createTextNode(post.title));
    right.appendChild(title);

    let byline = document.createElement("div");
    byline.setAttribute("class", "post-byline");
    byline.appendChild(document.createTextNode("submitted by "));
    let author = document.createElement("a");
    author.setAttribute("class", "post-author");
    author.setAttribute("href", redditURL + "u/" + post.author);
    author.appendChild(document.createTextNode(post.author));
    byline.appendChild(author);
    byline.appendChild(document.createTextNode(" to "));
    let subreddit = document.createElement("a");
    subreddit.setAttribute("class", "post-subreddit");
    subreddit.setAttribute("href", makeReaderSubredditURL(post.subreddit));
    subreddit.appendChild(document.createTextNode(post.subreddit));
    byline.appendChild(subreddit);
    let millisSincePosted = Math.round(Date.now() - post.created * 1000);
    byline.appendChild(document.createTextNode(" " + formatDuration(millisSincePosted) + " ago"));
    if (post.edited) {
        byline.appendChild(document.createTextNode("*"));
    }
    byline.appendChild(document.createTextNode(" (" + post.domain + ")"));
    if (post.over_18) {
        let nsfwTag = document.createElement("span");
        nsfwTag.setAttribute("class", "post-nsfw-tag");
        nsfwTag.appendChild(document.createTextNode("(nsfw)"));
        byline.appendChild(document.createTextNode(" "));
        byline.appendChild(nsfwTag);
    }
    if (post.spoiler) {
        let spoilerTag = document.createElement("span");
        spoilerTag.setAttribute("class", "post-spoiler-tag");
        spoilerTag.appendChild(document.createTextNode("(spoiler)"));
        byline.appendChild(document.createTextNode(" "));
        byline.appendChild(spoilerTag);
    }
    right.appendChild(byline);

    let openPreview = document.createElement("input");
    openPreview.setAttribute("value", "preview");
    openPreview.setAttribute("type", "button");
    openPreview.setAttribute("class", "post-links link-button");
    openPreview.setAttribute("onclick", "togglePreview(this)");
    right.appendChild(openPreview);

    let openLink = document.createElement("a");
    openLink.appendChild(document.createTextNode("reddit"));
    openLink.setAttribute("href", redditURL + post.permalink);
    openLink.setAttribute("target", "_blank");
    openLink.setAttribute("class", "post-links");
    right.appendChild(openLink);

    let openComments = document.createElement("input");
    openComments.setAttribute("value", "comments (" + post.num_comments + ")");
    openComments.setAttribute("type", "button");
    openComments.setAttribute("class", "post-links link-button");
    openComments.setAttribute("onclick", "toggleComments(this)");
    right.appendChild(openComments);

    let previewContainer = document.createElement("div");
    previewContainer.setAttribute("class", "post-preview-container");
    previewContainer.setAttribute("style", "display:none;");
    previewContainer.setAttribute("data-show", "hidden");
    bottom.appendChild(previewContainer);

    container.appendChild(left);
    container.appendChild(right);
    container.appendChild(bottom);
    return container;
}

// Toggle the preview window
function togglePreview(spawningButton) {
    let previewContainer = spawningButton
        .parentElement.parentElement.querySelector(".post-preview-container");
    if (previewContainer.dataset.show != "preview") {
        previewContainer.dataset.show = "preview";
        previewContainer.style.display = "block";
        previewContainer.innerHTML = "";
        //TODO
    } else {
        previewContainer.dataset.show = "hidden";
        previewContainer.style.display = "none";
    }
}

// Toggle the comments window
function toggleComments(spawningButton) {
    let previewContainer = spawningButton
        .parentElement.parentElement.querySelector(".post-preview-container");
    if (previewContainer.dataset.show != "comments") {
        previewContainer.dataset.show = "comments";
        previewContainer.style.display = "block";
        previewContainer.innerHTML = "";
        //TODO
    } else {
        previewContainer.dataset.show = "hidden";
        previewContainer.style.display = "none";
    }
}

// Get and parse the JSON from an API request
function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        fetchResult = fetch(url)
            .then(function (result) {
                result.text()
                    .then(function (text) {
                        resolve(JSON.parse(text));
                    })
                    .catch(function (err) {
                        reject(err);
                    });
            })
            .catch(function (err) {
                reject(err)
            });
    });
}

// Utility

// Format millisecond duration as a human-readable string
function formatDuration(millis) {
    let seconds = millis / 1000;
    if (seconds < 60) {
        return Math.round(seconds).toString() + " seconds";
    }
    let minutes = seconds / 60;
    if (minutes < 60) {
        return Math.round(minutes).toString() + " minutes";
    }
    let hours = minutes / 60;
    if (hours < 24) {
        return Math.round(hours).toString() + " hours";
    }
    let days = hours / 24;
    return Math.round(days).toString() + " days";
}

// Get URL parameters or a default if they do not exist
function getURLParam(name, default_ = null) {
    if (URLParams.has(name)) {
        return URLParams.get(name);
    } else {
        return default_;
    }
}