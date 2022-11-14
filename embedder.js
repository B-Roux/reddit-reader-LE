/*
 * Content embed logic
 */

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
        return makeMediaEmbed(post.url);
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
function makeMediaEmbed(url) {

    function fileExt(pathname) {
        let filename = pathname.substr(1 + pathname.lastIndexOf("/"))
        let ext = filename.substr(1 + filename.lastIndexOf("."));
        return (ext === "" || ext === undefined) ? null : ext.toLowerCase();
    }

    function makeImageNode(src) {
        const imageFileExts = [
            "jpg",
            "png",
            "gif",
            "svg",
            "tiff"
        ];
        if (imageFileExts.includes(fileExt(url.pathname))) {
            let container = document.createElement("div");
            container.setAttribute("class", "post-preview-container-imgs");
            let image = document.createElement("img");
            image.setAttribute("src", src);
            image.setAttribute("onclick", "toggleFit(this)");
            image.setAttribute("data-fit", "vertical");
            container.appendChild(image);
            return container.outerHTML;
        } else return null;
    }

    url = new URL(url);
    switch (url.hostname) {
        case "i.imgur.com":
        case "i.redd.it":
            return makeImageNode(url.href);
    }
    return null;
}

/* Quick Reference
    href:     http://username:password@host.com:80/pa/th?q=val#hash
    protocol: http
    username:        username
    password:                 password
    host:                              host.com:80
    hostname:                          host.com
    port:                                       80
    pathname:                                     /pa/th
    search:                                              q=val
    hash:                                                     #hash
*/

/* // OLD
try { // check for any kind of preview image
    let container = document.createElement("div");
    container.setAttribute("class", "post-preview-container-imgs");
    post.preview.images.forEach(child => {
        let image = document.createElement("img");
        image.setAttribute("src", child.source.url);
        image.setAttribute("onclick", "toggleFit(this)");
        image.setAttribute("data-fit", "vertical");
        container.appendChild(image);
    });
    return container.outerHTML;
} catch { // admit defeat :(
    return null;
}
*/