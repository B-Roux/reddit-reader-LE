/*
 * Misc. utility functions that keep the rest of the project clean
 */

// Make a URL that refers to a given query to the Reddit API
function makeSubredditJsonURL(
    subreddit,
    sort = "hot",
    time = "all",
    after = null,
    itemsPerPage = "20" // a string is better than an int here
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

// TEXT FORMATTING

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

// DATA ENCODE/DECODE

// Encode and decode UTF-8
// https://developer.mozilla.org/en-US/docs/Glossary/Base64
function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str));
}
function unicodeDecodeB64(str) {
    return decodeURIComponent(atob(str));
}
