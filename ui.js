/*
 * UI controls and generation
 */

// Make a subreddit page given the reddit API url and a destination node
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

    let mediaContent = getMediaContent(post); // embedder.js

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

// Make a comment section given the reddit API url and a destination container
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

// Make a comment thread recursively
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

// Make a single comment's content as an HTML node
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

// UI EVENT HANDLERS - called from UI elements

// Cached query
var subredditToFetch = thisSubreddit; // defined in script.js
var sortToFetch = thisSort; // defined in script.js
var timeToFetch = thisTime; // defined in script.js

// Cached element refs (uninitialized)
var timeSelectorRadio = null;

// UI Main
window.addEventListener('DOMContentLoaded', (_) => {

    // Bind UI refs
    timeSelectorRadio = document.querySelector("#time-selector-group");

    // Initialize UI
    if (thisSort == "controversial" || thisSort == "top") {
        timeSelectorRadio.style.display = "inline";
    } else {
        timeSelectorRadio.style.display = "none";
    }
    document.querySelector("#subreddit-name").value = thisSubreddit;
    document.querySelectorAll('.sort-selector').forEach((radioButton) => {
        radioButton.checked = radioButton.value == thisSort;
    });
    document.querySelectorAll('.time-selector').forEach((radioButton) => {
        radioButton.checked = radioButton.value == thisTime;
    });
});

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

// Toggle an image's fit (horizontally vs. vertically)
function toggleFit(source) {
    if (source.dataset.fit == "vertical") {
        source.dataset.fit = "horizontal";
    } else {
        source.dataset.fit = "vertical";
    }
}

// Toggle a post's preview window
function togglePreview(spawningButton) {
    let previewContainer = spawningButton
        .parentElement.parentElement.querySelector(".post-preview-container");
    if (previewContainer.dataset.show != "true") {
        previewContainer.dataset.show = "true";
        previewContainer.style.display = "";
        previewContainer.innerHTML = unicodeDecodeB64(
            previewContainer.dataset.content
        );
    } else {
        previewContainer.dataset.show = "false";
        previewContainer.style.display = "none";
        previewContainer.innerHTML = "";
    }
}

// Toggle a post's comment section
function toggleComments(spawningButton) {
    let commentsContainer = spawningButton
        .parentElement.parentElement.querySelector(".post-comments-container");
    if (commentsContainer.dataset.show != "true") {
        commentsContainer.dataset.show = "true";
        commentsContainer.style.display = "";
        makeCommentsSection(
            unicodeDecodeB64(commentsContainer.dataset.source),
            commentsContainer
        );
    } else {
        commentsContainer.dataset.show = "false";
        commentsContainer.style.display = "none";
        commentsContainer.innerHTML = "";
    }
}
