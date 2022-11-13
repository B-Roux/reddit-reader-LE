// Get an embeddable media object
function getMediaContent(post) {
    if (typeof post.selftext_html == "string" && post.selftext_html != "") {
        let container = document.createElement("div");
        container.setAttribute("class", "post-preview-container-selftext");
        container.innerHTML = post.selftext_html
        return container.outerHTML;
    } else if (typeof post.secure_media_embed.content == "string") {
        return getProvidedEmbed(post.secure_media_embed.content);
    } else if (typeof post.media_embed.content == "string") {
        return getProvidedEmbed(post.media_embed.content);
    } else { // Then try to make an embed ourselves
        return makeMediaEmbed_OLD(post);
        return makeMediaEmbed(post.domain, post.url);
    }
}

// Manage arbitrary raw HTML embeds
function getProvidedEmbed(providedEmbedCode) {
    // HTML parser trick
    let dummyElement = document.createElement("div");
    dummyElement.innerHTML = providedEmbedCode;

    let container = document.createElement("div");

    if (dummyElement.childNodes.length == 1 && dummyElement.childNodes[0].tagName == "IFRAME") {
        container.setAttribute("class", "post-preview-container-media");
        container.appendChild(dummyElement.childNodes[0]);
    } else {
        container.setAttribute("class", "post-preview-container-rawhtml");
        dummyElement.childNodes.forEach(element => { container.appendChild(element); });
    }

    return container.outerHTML;
}

// TODO
function makeMediaEmbed (domain, url) {
    switch(domain) {
        case "i.redd.it":
            return undefined;
    }
}


// TODO: Remove this
function makeMediaEmbed_OLD (post) {
    try { // Then check for any kind of preview image
        let container = document.createElement("div");
        container.setAttribute("class", "post-preview-container-imgs");
        post.preview.images.forEach(child => {
            let image = document.createElement("img");
            image.setAttribute("src", child.source.url);
            image.setAttribute("onclick", "toggleFit(this)");
            image.setAttribute("data-fit", "vertical");
            if (child.source.width > child.source.height) {
                image.setAttribute("class", "landscape");
            } else {
                image.setAttribute("class", "portrait");
            }
            container.appendChild(image);
        });
        return container.outerHTML;
    } catch { // admit defeat :(
        return null;
    }
}
