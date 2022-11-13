// URLs/APIs/etc.
const redditURL = "https://www.reddit.com";
const redditAPI = "https://api.reddit.com";

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
function makeSubredditJsonURL(
    subreddit, 
    sort = "hot", 
    time = "all", 
    after = null
) {
    let url = redditAPI +
        `/r/${subreddit}/${sort}?raw_json=1&limit=${itemsPerPage}`;
    if (sort == "controversial" || sort == "top") {
        url += `&t=${time}`;
    }
    if (after !== null) {
        url += `&after=${after}`;
    }
    return url;
}

// Make a URL that refers to a given query on this reader
function makeReaderSubredditURL(
    subreddit, 
    sort = "hot", 
    time = "all", 
    after = null
) { //TODO
    let url = `./index.html?subreddit=${subreddit}&sort=${sort}`;
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
            let errorContainer = document.createElement("div");
            errorContainer.setAttribute("id", "error-container");
            let header = document.createElement("h1");
            header.appendChild(document.createTextNode("There was a problem..."));
            errorContainer.appendChild(header);
            let description = document.createElement("p");
            description.appendChild(document.createTextNode(
                "We couldn't find what you're looking for. Try this:"
            ));
            errorContainer.appendChild(description);
            let troubleshoot = document.createElement("ul");
            let firefoxETP = document.createElement("li");
            firefoxETP.appendChild(document.createTextNode(
                "If you are using FireFox (including FireFox Focus as " +
                "a content blocker), ensure that Enhanced Tracking " +
                "Protection is off for this site. This setting prevents " +
                "us from interacting with the Reddit API."
            ));
            troubleshoot.appendChild(firefoxETP);
            let subredditName = document.createElement("li");
            subredditName.appendChild(document.createTextNode(
                "Ensure that the subreddit name is typed in correctly - were you " +
                `trying to reach "r/${thisSubreddit}"?`
            ));
            troubleshoot.appendChild(subredditName);
            let redditStatus = document.createElement("li");
            redditStatus.appendChild(document.createTextNode(
                "Ensure that Reddit is currently working (redditstatus.com)."
            ));
            troubleshoot.appendChild(redditStatus);
            errorContainer.appendChild(troubleshoot);
            let resolution = document.createElement("p");
            resolution.appendChild(document.createTextNode(
                "If this does not work or apply to you, " +
                "we may be experiencing technical " +
                "difficulties. We apologize."
            ));
            errorContainer.appendChild(resolution);
            let errorInformation = document.createElement("code");
            errorInformation.appendChild(document.createTextNode(err));
            errorContainer.appendChild(errorInformation);
            destination.appendChild(errorContainer);
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
    score.appendChild(
        document.createTextNode(formatScore(post.score, post.upvote_ratio))
    );
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
    author.setAttribute("href", redditURL + `/u/${post.author}`);
    author.appendChild(document.createTextNode(`u/${post.author}`));
    byline.appendChild(author);
    byline.appendChild(document.createTextNode(" to "));
    let subreddit = document.createElement("a");
    subreddit.setAttribute("class", "post-subreddit");
    subreddit.setAttribute("href", makeReaderSubredditURL(post.subreddit));
    subreddit.appendChild(document.createTextNode(`r/${post.subreddit}`));
    byline.appendChild(subreddit);
    let millisSincePosted = Math.round(Date.now() - post.created * 1000);
    byline.appendChild(
        document.createTextNode(` ${formatDuration(millisSincePosted)} ago`)
    );
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

    let mediaContent = getMediaContent(post); // ./embedder.js

    let togglePreview = document.createElement("input");
    togglePreview.setAttribute("value", "preview");
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
        previewContainer.setAttribute("data-show", "false");
        previewContainer.setAttribute("data-content", b64EncodeUnicode(mediaContent));
        bottom.appendChild(previewContainer);
    }

    let commentsContainer = document.createElement("div");
    commentsContainer.setAttribute("class", "post-comments-container");
    commentsContainer.setAttribute("style", "display:none;");
    commentsContainer.setAttribute("data-show", "false");
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

function makeCommentsSection(url, destination) {
    let noteElement = document.createElement("div");
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

function makeThreadRecursive(parent, depth = 1, maxDepth = 8) {

    function makeMoreCommentsLink(message = "continue thread") {
        let subContainer = document.createElement("div");
        subContainer.setAttribute("class", "comment-container");

        let continueThread = document.createElement("a");
        continueThread.setAttribute("target", "_blank");
        continueThread.setAttribute("href", `${redditURL}${parent.data.permalink}`);
        continueThread.setAttribute("class", "comments-continue-link");
        continueThread.appendChild(document.createTextNode(message));

        subContainer.appendChild(continueThread);
        return subContainer;
    }

    if (parent.kind == "more") { return makeMoreCommentsLink(); }
    if (depth > maxDepth) { return null; }

    let container = document.createElement("div");
    container.setAttribute("class", "comment-container");
    container.appendChild(makeCommentNode(parent.data));

    try {
        parent.data.replies.data.children.forEach(child => {
            if (child.kind == "more") {
                container.appendChild(makeMoreCommentsLink());
                return container;
            } else {
                let childThread = makeThreadRecursive(child, depth + 1);
                if (childThread !== null) {
                    container.appendChild(childThread);
                }
                if (depth + 1 > maxDepth) {
                    container.appendChild(makeMoreCommentsLink());
                }
            }

        });
    } catch { } //Just end the thread :-)
    return container;
}

// TODO: Make this prettier :/
function makeCommentNode(comment) {
    let container = document.createElement("div");

    let author = document.createElement("a");
    author.setAttribute("class", "comment-author");
    author.setAttribute("target", "_blank");
    author.setAttribute("href", redditURL + `/u/${comment.author}`);
    author.appendChild(document.createTextNode(`u/${comment.author}`));
    container.appendChild(author);

    let byline = document.createElement("div");
    byline.setAttribute("class", "comment-byline");
    let millisSincePosted = Math.round(Date.now() - comment.created * 1000);
    let controversial = ""
    if (comment.controversiality > 0) {
        controversial = "\u2020"
    }
    let edited = ""
    if (comment.edited) {
        edited = "*"
    }
    byline.appendChild(
        document.createTextNode(
            `${pluralize(comment.score, "point")}${controversial} ` +
            `${formatDuration(millisSincePosted)} ago${edited}`
        )
    );
    container.appendChild(byline);

    let body = document.createElement("div");
    body.setAttribute("class", "comment-body");
    body.innerHTML = comment.body_html;
    container.appendChild(body);

    let links = document.createElement("div");
    links.setAttribute("class", "comment-links");

    let permalink = document.createElement("a");
    permalink.setAttribute("href", redditURL + comment.permalink);
    permalink.setAttribute("target", "_blank");
    permalink.appendChild(document.createTextNode("permalink"));
    links.appendChild(permalink);

    let context = document.createElement("a");
    const contextDepth = "8";
    context.setAttribute("href", `${redditURL}${comment.permalink}?context=${contextDepth}`);
    context.setAttribute("target", "_blank");
    context.appendChild(document.createTextNode("context"));
    links.appendChild(context);

    container.appendChild(links);

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

// Make something plural if there's not exactly one of it
function pluralize(amount, unit) {
    if (amount == '1') {
        return `1 ${unit}`;
    } else {
        return `${amount} ${unit}s`;
    }
}

// Format millisecond duration as a human-readable string
function formatDuration(millis) {
    let seconds = millis / 1000;
    if (seconds < 60) {
        return pluralize(Math.round(seconds).toString(), 'second');
    }
    let minutes = seconds / 60;
    if (minutes < 60) {
        return pluralize(Math.round(minutes).toString(), 'minute');
    }
    let hours = minutes / 60;
    if (hours < 24) {
        return pluralize(Math.round(hours).toString(), 'hour');
    }
    let days = hours / 24;
    if (days < 365) {
        return pluralize(Math.round(days).toString(), 'day');
    }
    let years = days / 365.25;
    return pluralize(Math.round(years).toString(), 'year');
}

function formatScore(score, ratio) {
    let scoreFmt;
    let ratioFmt = Math.round(ratio * 100).toString();
    if (score > 1000) {
        scoreFmt = Math.round(score / 1000).toString() + "K";
    } else {
        scoreFmt = score.toString();
    }
    return `${scoreFmt} (${ratioFmt}%)`
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
