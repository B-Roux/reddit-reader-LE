makeSubredditPage(
    "https://www.reddit.com/r/pics/.json",
    document.querySelector("#destination")
);

function makeSubredditPage(url, destination) {
    fetchRedditPage(url).then(function (data) {
        let children = data.data.children;
        children.forEach(child => { destination.appendChild(makePostNode(child)); });
    });
}

function makePostNode(post) {
    const redditURL = "https://www.reddit.com/";

    let cont = document.createElement("div");
    cont.setAttribute("class", "post-container");

    let score = document.createElement("div");
    score.setAttribute("class", "post-score");
    score.appendChild(document.createTextNode(post.data.score.toLocaleString()));
    cont.appendChild(score);

    if (
        post.data.thumbnail == "self"
        || post.data.thumbnail == "spoiler"
        || post.data.thumbnail == "nsfw"
    ) {
        let thumbnailContainer = document.createElement("div");
        thumbnailContainer.setAttribute("class", "post-thumbnail");
        cont.appendChild(thumbnailContainer);
    } else {
        let thumbnailContainer = document.createElement("div");
        thumbnailContainer.setAttribute("class", "post-thumbnail");
        let thumbnail = document.createElement("img");
        thumbnail.setAttribute("src", post.data.thumbnail);
        thumbnailContainer.appendChild(thumbnail);
        cont.appendChild(thumbnailContainer);
    }

    let title = document.createElement("div");
    if (post.data.stickied) {
        title.setAttribute("class", "post-title sticky-post");
    } else {
        title.setAttribute("class", "post-title");
    }
    title.appendChild(document.createTextNode(post.data.title));
    cont.appendChild(title);

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
    if (post.data.over_18) {
        let nsfwTag = document.createElement("span");
        nsfwTag.setAttribute("class", "post-nsfw-tag");
        nsfwTag.appendChild(document.createTextNode("nsfw"));
        byline.appendChild(document.createTextNode(" "));
        byline.appendChild(nsfwTag);
    }
    if (post.data.spoiler) {
        let spoilerTag = document.createElement("span");
        spoilerTag.setAttribute("class", "post-spoiler-tag");
        spoilerTag.appendChild(document.createTextNode("spoiler"));
        byline.appendChild(document.createTextNode(" "));
        byline.appendChild(spoilerTag);
    }
    cont.appendChild(byline);

    let actions = document.createElement("div");
    actions.setAttribute("class", "post-actions");
    let openPost = document.createElement("a");
    openPost.appendChild(document.createTextNode("comments (" + post.data.num_comments + ")"));
    openPost.setAttribute("href", redditURL + post.data.permalink);
    openPost.setAttribute("target", "_blank");
    actions.appendChild(openPost);
    actions.appendChild(document.createTextNode(" "));
    let openOnReddit = document.createElement("a");
    openOnReddit.appendChild(document.createTextNode("open on reddit"));
    openOnReddit.setAttribute("href", redditURL + post.data.permalink);
    openOnReddit.setAttribute("target", "_blank");
    actions.appendChild(openOnReddit);
    cont.appendChild(actions);


    return cont;
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