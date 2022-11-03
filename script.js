// URLs/APIs/etc.
const redditURL = "https://www.reddit.com/";
const redditAPI = "https://api.reddit.com/";

// For quick debugging
//const readerURL = "file:///C:/Users/baren/source/repos/birddit/index.html";

// Actual site
const readerURL = "https://reddit-reader.projects.b-roux.com/"

// Cache the URL parameters
const URLParams = new URLSearchParams(window.location.search);
const thisSubreddit = getURLParam("subreddit", "all");
const thisSort = getURLParam("sort", "hot");
const thisTime = getURLParam("time", "all");
const thisAfter = getURLParam("after", null);

// Config params
const itemsPerPage = "20"; // a string is better here for URL params

// Cached query
var subredditToFetch = thisSubreddit;
var sortToFetch = thisSort;
var timeToFetch = thisTime;

// Cached element refs
var timeSelectorRadio = null;

// Main - to be run after the DOM is fully loaded
window.addEventListener('DOMContentLoaded', (event) => {
    // Bind UI elements
    timeSelectorRadio = document.querySelector("#time-selector-group");

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
    makeSubredditPage(url, document.querySelector("#generator-destination"));
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
        timeToFetch
    );
}

// Functionality

// Make a URL that refers to a given query to the Reddit API
function makeSubredditJsonURL(subreddit, sort = "hot", time = "all", after = null) {
    let url = redditAPI + `r/${subreddit}/${sort}?raw_json=1&limit=${itemsPerPage}`;
    if (sort == "controversial" || sort == "top") {
        url += `&t=${time}`;
    }
    if (after !== null) {
        url += `&after=${after}`;
    }
    return url;
}

// Make a URL that refers to a given query on this reader
function makeReaderSubredditURL(subreddit, sort = "hot", time = "all", after = null) {
    let url = readerURL + `?subreddit=${subreddit}&sort=${sort}`;
    if (sort == "controversial" || sort == "top") {
        url += `&time=${time}`;
    }
    if (after !== null) {
        url += `&after=${after}`;
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
            alert(err); //TODO: print a nice looking error message
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

    let thumbBox = document.createElement("div");
    thumbBox.setAttribute("class", "post-thumb-box");
    let score = document.createElement("div");
    score.setAttribute("class", "post-score");
    score.appendChild(document.createTextNode(post.score.toLocaleString()));
    thumbBox.appendChild(score);
    let thumbnailContainer = document.createElement("div");
    if (
        post.thumbnail == "self"
        || post.thumbnail == "spoiler"
        || post.thumbnail == "nsfw"
        || post.thumbnail == "default"
        || post.thumbnail == "image"
        || post.thumbnail === ""
    ) {
        let type = post.thumbnail;
        if (post.thumbnail === "") { type = "default"; }
        thumbnailContainer.setAttribute(
            "class",
            "post-no-thumbnail no-thumbnail-type-" + type
        );
        thumbBox.appendChild(thumbnailContainer);
    } else {
        thumbnailContainer.setAttribute("class", "post-thumbnail");
        let thumbnail = document.createElement("img");
        thumbnail.setAttribute("src", post.thumbnail);
        thumbnail.setAttribute("draggable", "false");
        thumbnailContainer.appendChild(thumbnail);
        thumbBox.appendChild(thumbnailContainer);
    }
    left.appendChild(thumbBox);

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

    right.appendChild(document.createElement("br"));

    let byline = document.createElement("div");
    byline.setAttribute("class", "post-byline");
    byline.appendChild(document.createTextNode("submitted by "));
    let author = document.createElement("a");
    author.setAttribute("class", "post-author");
    author.setAttribute("href", redditURL + `u/${post.author}`);
    author.appendChild(document.createTextNode(post.author));
    byline.appendChild(author);
    byline.appendChild(document.createTextNode(" to "));
    let subreddit = document.createElement("a");
    subreddit.setAttribute("class", "post-subreddit");
    subreddit.setAttribute("href", makeReaderSubredditURL(post.subreddit));
    subreddit.appendChild(document.createTextNode(post.subreddit));
    byline.appendChild(subreddit);
    let millisSincePosted = Math.round(Date.now() - post.created * 1000);
    byline.appendChild(document.createTextNode(` ${formatDuration(millisSincePosted)} ago`));
    if (post.edited) {
        byline.appendChild(document.createTextNode("*"));
    }
    let domain = document.createElement("i");
    domain.appendChild(document.createTextNode(` (${post.domain})`));
    byline.appendChild(domain);
    if (post.over_18) {
        byline.appendChild(document.createTextNode(" "));
        let nsfwTag = document.createElement("i");
        nsfwTag.setAttribute("class", "post-nsfw-tag");
        nsfwTag.appendChild(document.createTextNode("[nsfw]"));
        byline.appendChild(nsfwTag);
    }
    if (post.spoiler) {
        byline.appendChild(document.createTextNode(" "));
        let spoilerTag = document.createElement("i");
        spoilerTag.setAttribute("class", "post-spoiler-tag");
        spoilerTag.appendChild(document.createTextNode("[spoiler]"));
        byline.appendChild(spoilerTag);
    }
    right.appendChild(byline);

    let mediaContent = getMediaContent(post);

    let togglePreview = document.createElement("input");
    togglePreview.setAttribute("value", "view");
    togglePreview.setAttribute("type", "button");
    if (mediaContent === null) {
        togglePreview.setAttribute("class", "post-links link-button not-available");
    } else {
        togglePreview.setAttribute("class", "post-links link-button");
        togglePreview.setAttribute("onclick", "togglePreview(this)");
    }
    right.appendChild(togglePreview);

    let openReddit = document.createElement("a");
    openReddit.setAttribute("href", redditURL + post.permalink);
    openReddit.setAttribute("target", "_blank");
    openReddit.setAttribute("class", "post-links");
    openReddit.appendChild(document.createTextNode("permalink"));
    right.appendChild(openReddit);

    let toggleComments = document.createElement("input");
    toggleComments.setAttribute("value", `comments (${post.num_comments})`);
    toggleComments.setAttribute("class", "post-links link-button");
    toggleComments.setAttribute("type", "button");
    toggleComments.setAttribute("onclick", `toggleComments(this)`);
    right.appendChild(toggleComments);

    if (mediaContent !== null) {
        let previewContainer = document.createElement("div");
        previewContainer.setAttribute("class", "post-preview-container");
        previewContainer.setAttribute("style", "display:none;");
        previewContainer.setAttribute("data-show", "hide");
        previewContainer.setAttribute("data-content", b64EncodeUnicode(mediaContent));
        bottom.appendChild(previewContainer);
    }

    let commentsContainer = document.createElement("div");
    commentsContainer.setAttribute("class", "post-comments-container");
    commentsContainer.setAttribute("style", "display:none;");
    commentsContainer.setAttribute("data-show", "hide");
    commentsContainer.setAttribute(
        "data-source", b64EncodeUnicode(
            `${redditAPI}${post.permalink}?raw_json=1`
        )
    );
    bottom.appendChild(commentsContainer);

    container.appendChild(left);
    container.appendChild(right);
    container.appendChild(bottom);
    return container;
}

// Get an embeddable media object
function getMediaContent(post) {
    if (typeof post.selftext_html == "string") {
        let container = document.createElement("div");
        container.setAttribute("class", "post-preview-container-selftext");
        container.innerHTML = post.selftext_html
        return container.outerHTML;
    } else if (typeof post.secure_media_embed.content == "string") {
        return manageArbitraryMediaEmbed(post.secure_media_embed.content);
    } else if (typeof post.media_embed.content == "string") {
        return manageArbitraryMediaEmbed(post.media_embed.content);
    } else {
        return null;
    }
}

// Manage arbitrary HTML embeds from reddit API
function manageArbitraryMediaEmbed(embedCode) {
    let dummyElement = document.createElement("div");
    dummyElement.innerHTML = embedCode;

    let container = document.createElement("div");

    if (dummyElement.childNodes.length == 1 && dummyElement.childNodes[0].tagName == "IFRAME") {
        container.setAttribute("class", "post-preview-container-media");
        container.appendChild(dummyElement.childNodes[0]);
    } else {
        container.setAttribute("class", "post-preview-container-rawhtml");
        htmlDoc.childNodes.forEach(element => { container.appendChild(element); });
    }

    return container.outerHTML;
}



// Toggle the preview window
function togglePreview(spawningButton) {
    let previewContainer = spawningButton
        .parentElement.parentElement.querySelector(".post-preview-container");
    if (previewContainer.dataset.show != "show") {
        previewContainer.dataset.show = "show";
        previewContainer.style.display = "block";
        previewContainer.innerHTML = unicodeDecodeB64(previewContainer.dataset.content);
    } else {
        previewContainer.dataset.show = "hide";
        previewContainer.style.display = "none";
        previewContainer.innerHTML = "";
    }
}

// TODO: Toggle the comments window
function toggleComments(spawningButton) {
    let commentsContainer = spawningButton
        .parentElement.parentElement.querySelector(".post-comments-container");
    if (commentsContainer.dataset.show != "show") {
        commentsContainer.dataset.show = "show";
        commentsContainer.style.display = "block";
        makeCommentsSection(unicodeDecodeB64(commentsContainer.dataset.source), commentsContainer);
    } else {
        commentsContainer.dataset.show = "hide";
        commentsContainer.style.display = "none";
        commentsContainer.innerHTML = "";
    }
}

var dbgResult = null;

function makeCommentsSection(url, destination) {
    let noteElement = document.createElement("span");
    noteElement.setAttribute("class", "comment-note");
    noteElement.appendChild(document.createTextNode("loading..."))
    destination.appendChild(noteElement);
    let note = destination.querySelector(".comment-note");
    fetchJSON(url)
        .then(function (data) {
            data[1].data.children.forEach(child => {
                let childThread = makeThreadRecursive(child);
                if (childThread !== null) {
                    destination.appendChild(childThread);
                }
            });
            note.style.display = "none";
        })
        .catch(function (err) {
            note.innerHTML = "";
            note.appendChild(document.createTextNode(err));
        });
}

function makeThreadRecursive(parent, depth=0) {
    const maxDepth = 8;

    if (depth > maxDepth) {
        return null;
    }

    let container = document.createElement("div");
    container.setAttribute("class", "comment-container");
    container.appendChild(makeCommentNode(parent.data));

    try {
        parent.data.replies.data.children.forEach(child => {
            let childThread = makeThreadRecursive(child, depth + 1);
            if (childThread !== null) {
                container.appendChild(childThread);
            }
        });
    } catch {
        // Thread ends, nothing needs to be done :-)
    }

    // If there are more than $maxDepth comments in a thread, overflow to Reddit
    if (depth+1 > maxDepth) { 
        let subContainer = document.createElement("div");
        subContainer.setAttribute("class", "comment-container");
        let continueThread = document.createElement("a");
        continueThread.setAttribute("target", "_blank");
        continueThread.setAttribute("href", `${redditURL}${parent.data.permalink}`);
        continueThread.appendChild(document.createTextNode("continue thread on reddit"));
        subContainer.appendChild(continueThread);
        container.appendChild(subContainer);
    }

    return container;
}

function makeCommentNode(comment) {
    let container = document.createElement("div");
    let body = document.createElement("div");
    body.innerHTML = comment.body_html;
    container.appendChild(body);
    return container;
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
        return `${Math.round(seconds)} seconds`;
    }
    let minutes = seconds / 60;
    if (minutes < 60) {
        return `${Math.round(minutes)} minutes`;
    }
    let hours = minutes / 60;
    if (hours < 24) {
        return `${Math.round(hours)} hours`;
    }
    let days = hours / 24;
    return `${Math.round(days)} days`;
}

// Get URL parameters or a default if they do not exist
function getURLParam(name, default_ = null) {
    if (URLParams.has(name)) {
        return URLParams.get(name);
    } else {
        return default_;
    }
}

// Encode and decode UTF-8
// https://developer.mozilla.org/en-US/docs/Glossary/Base64
function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str));
}
function unicodeDecodeB64(str) {
    return decodeURIComponent(atob(str));
}