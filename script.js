// Main
window.addEventListener('DOMContentLoaded', (event) => {
    getNewPostPage();
});

// UI controls
subredditToFetch = "all";
function changeSubreddit(value) {
    subredditToFetch = value;
}

sortToFetch = "hot";
function changeSort(value) {
    if (value == "controversial" || value == "top") {
        document.querySelector("#from-time-radio").style = "display: initial;";
    } else {
        document.querySelector("#from-time-radio").style = "display: none;";
    }
    sortToFetch = value;
}

timeToFetch = "all";
function changeTime(value) {
    timeToFetch = value;
}

function makeRedditURL() {
    let url = "https://api.reddit.com/r/" + subredditToFetch + "/" + sortToFetch + "/.json";
    if (sortToFetch == "controversial" || sortToFetch == "top") {
        url += "?t=" + timeToFetch;
    }
    return url;
}

function getNewPostPage() {
    url = makeRedditURL();
    console.log(url);
    makeSubredditPage(
        url,
        document.querySelector(".post-list")
    );
}

// Reddit API interface


function makeSubredditPage(url, destination) {
    fetchRedditPage(url)
        .then(function (data) {
            destination.replaceChildren([]);
            data.data.children.forEach(child => { destination.appendChild(makePostNode(child)); });
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
    score.appendChild(document.createTextNode(post.data.score.toLocaleString()));
    left.appendChild(score);

    if (
        post.data.thumbnail == "self"
        || post.data.thumbnail == "spoiler"
        || post.data.thumbnail == "nsfw"
        || post.data.thumbnail == "default"
        || post.data.thumbnail == ""
    ) {
        let thumbnailContainer = document.createElement("div");
        thumbnailContainer.setAttribute("class", "post-no-thumbnail no-thumbnail-type-" + post.data.thumbnail);
        left.appendChild(thumbnailContainer);
    } else {
        let thumbnailContainer = document.createElement("div");
        thumbnailContainer.setAttribute("class", "post-thumbnail");
        let thumbnail = document.createElement("img");
        thumbnail.setAttribute("src", post.data.thumbnail);
        thumbnailContainer.appendChild(thumbnail);
        left.appendChild(thumbnailContainer);
    }

    let title = document.createElement("a");
    title.setAttribute("href", post.data.url);
    title.setAttribute("target", "_blank");
    if (post.data.stickied) {
        title.setAttribute("class", "post-title sticky-post");
    } else {
        title.setAttribute("class", "post-title");
    }
    title.appendChild(document.createTextNode(post.data.title));
    right.appendChild(title);

    let byline = document.createElement("div");
    byline.setAttribute("class", "post-byline");
    byline.appendChild(document.createTextNode("submitted by "));
    let author = document.createElement("a");
    author.setAttribute("class", "post-author");
    author.setAttribute("href", redditURL + "u/" + post.data.author);
    author.appendChild(document.createTextNode(post.data.author));
    byline.appendChild(author);
    byline.appendChild(document.createTextNode(" to "));
    let subreddit = document.createElement("a");
    subreddit.setAttribute("class", "post-subreddit");
    subreddit.setAttribute("href", redditURL + "r/" + post.data.subreddit);
    subreddit.appendChild(document.createTextNode(post.data.subreddit));
    byline.appendChild(subreddit);
    let millisSincePosted = Math.round(Date.now() - post.data.created*1000);
    byline.appendChild(document.createTextNode(" " + formatDuration(millisSincePosted) + " ago"));
    if (post.data.edited) {
        byline.appendChild(document.createTextNode("*"));
    }
    if (post.data.over_18) {
        let nsfwTag = document.createElement("span");
        nsfwTag.setAttribute("class", "post-nsfw-tag");
        nsfwTag.appendChild(document.createTextNode("(nsfw)"));
        byline.appendChild(document.createTextNode(" "));
        byline.appendChild(nsfwTag);
    }
    if (post.data.spoiler) {
        let spoilerTag = document.createElement("span");
        spoilerTag.setAttribute("class", "post-spoiler-tag");
        spoilerTag.appendChild(document.createTextNode("(spoiler)"));
        byline.appendChild(document.createTextNode(" "));
        byline.appendChild(spoilerTag);
    }
    right.appendChild(byline);

    let openLink = document.createElement("a");
    openLink.appendChild(document.createTextNode("reddit"));
    openLink.setAttribute("href", redditURL + post.data.permalink);
    openLink.setAttribute("target", "_blank");
    openLink.setAttribute("class", "post-links");
    right.appendChild(openLink);

    let openComments = document.createElement("a");
    openComments.appendChild(document.createTextNode("comments (" + post.data.num_comments + ")"));
    openComments.setAttribute("href", redditURL + post.data.permalink);
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