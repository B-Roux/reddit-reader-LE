const URLParams = new URLSearchParams(window.location.search);

var subredditToFetch = null;
var sortToFetch = null;
var timeToFetch = null;

var timeSelectorRadio = null;
var generatorDestination = null;

// Main

window.addEventListener('DOMContentLoaded', (event) => {
    // Bind UI elements
    timeSelectorRadio = document.querySelector("#from-time-radio");
    generatorDestination = document.querySelector("#generator-destination");

    // Initialize globals
    subredditToFetch = getURLParam("subreddit", "all");
    sortToFetch = getURLParam("sort", "hot");
    timeToFetch = getURLParam("time", "all");

    // Initialize UI
    document.querySelector("#subreddit-name").value = subredditToFetch;
    document.querySelectorAll('.sort-selector').forEach((radioButton) => {
        radioButton.checked = radioButton.value == sortToFetch;
    });
    document.querySelectorAll('.time-selector').forEach((radioButton) => {
        radioButton.checked = radioButton.value == timeToFetch;
    });
    if (sortToFetch == "controversial" || sortToFetch == "top") {
        timeSelectorRadio.style = "display: initial;";
    } else {
        timeSelectorRadio.style = "display: none;";
    }

    // Load the requested information
    loadNewPage();
});

// UI controls

function changeSubreddit(value) {
    subredditToFetch = value;
}
function changeSort(value) {
    if (value == "controversial" || value == "top") {
        timeSelectorRadio.style = "display: initial;";
    } else {
        timeSelectorRadio.style = "display: none;";
    }
    sortToFetch = value;
}
function changeTime(value) {
    timeToFetch = value;
}

function navigateToQueriedPage() {
    window.location.href = makeReaderSubredditURL(
        subredditToFetch,
        sortToFetch,
        timeToFetch,
        null
    );
}

// Functionality

function loadNewPage() {
    let url = makeRedditURL(
        getURLParam("subreddit", "all"),
        getURLParam("sort", "hot"),
        getURLParam("time", "all"),
        getURLParam("after", null)
    );
    makeSubredditPage(url, generatorDestination);
}

function makeRedditURL(subreddit, sort, time, after=null) {
    let url = "https://api.reddit.com/r/" + subreddit + "/" + sort;
    if (sort == "controversial" || sort == "top") {
        url += "?t=" + time;
        if (after != null) {
            url += "&after=" + after;
        }
    } else {
        if (after != null) {
            url += "?after=" + after;
        }
    }
    return url;
}

function makeReaderSubredditURL(subreddit, sort="hot", time="all", after=null) {
    let url = "file:///C:/Users/baren/source/repos/birddit/index.html" //TODO
    + "?subreddit=" + subreddit
    + "&sort=" + sort;
    if (sort == "controversial" || sort == "top") {
        url += "&time=" + time;
    }
    if (after != null) {
        url += "&after=" + after;
    }
    console.log(url);
    return url;
}

function getURLParam(name, default_=null) {
    if (URLParams.has(name)) {
        return URLParams.get(name);
    } else {
        return default_;
    }
}

// Reddit API interface

function makeSubredditPage(url, destination) {
    fetchRedditPage(url)
        .then(function (data) {
            data.data.children.forEach(child => {
                destination.appendChild(makePostNode(child.data)); 
            });
        })
        .catch(function (err) {
            alert(err);
        });
}

function makePostNode(post) {
    const redditURL = "https://www.reddit.com/";

    let container = document.createElement("div");
    container.setAttribute("class", "post-container");

    let left = document.createElement("div");
    left.setAttribute("class", "post-container-left");

    let right = document.createElement("div");
    right.setAttribute("class", "post-container-right");

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
    let millisSincePosted = Math.round(Date.now() - post.created*1000);
    byline.appendChild(document.createTextNode(" " + formatDuration(millisSincePosted) + " ago"));
    if (post.edited) {
        byline.appendChild(document.createTextNode("*"));
    }
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

    let openLink = document.createElement("a");
    openLink.appendChild(document.createTextNode("reddit"));
    openLink.setAttribute("href", redditURL + post.permalink);
    openLink.setAttribute("target", "_blank");
    openLink.setAttribute("class", "post-links");
    right.appendChild(openLink);

    let openComments = document.createElement("a");
    openComments.appendChild(document.createTextNode("comments (" + post.num_comments + ")"));
    openComments.setAttribute("href", redditURL + post.permalink);
    openComments.setAttribute("target", "_blank");
    openComments.setAttribute("class", "post-links");
    right.appendChild(openComments);

    container.appendChild(left);
    container.appendChild(right);
    return container;
}

function formatDuration(millis) {
    let seconds = millis/1000;
    if (seconds < 60) {
        return Math.round(seconds).toString() + " seconds";
    }
    let minutes = seconds/60;
    if (minutes < 60) {
        return Math.round(minutes).toString() + " minutes";
    }
    let hours = minutes/60;
    if (hours < 24) {
        return Math.round(hours).toString() + " hours";
    }
    let days = hours/24;
    return Math.round(days).toString() + " days";
}

function fetchRedditPage(url) {
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