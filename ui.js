function toggleFit(source) {
    if (source.dataset.fit == "vertical") {
        source.style.width = "100%";
        source.style.height = "auto";
        source.dataset.fit = "horizontal";
        source.style.cursor = "zoom-out";
    } else {
        source.style.width = "";
        source.style.height = "";
        source.style.cursor = "";
        source.dataset.fit = "vertical";
    }
}

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
