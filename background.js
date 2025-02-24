const browser = typeof chrome !== 'undefined' ? chrome : browser;

browser.runtime.onInstalled.addListener(() => {
    console.log("YouTube Feed Shuffler Installed");
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startWatching") {
        startSession();
    }
    if (message.action === "stopWatching") {
        stopSession();
    }
    // Optionally, you can still allow a manual next video trigger if desired.
    if (message.action === "nextVideo" && sessionActive) {
        playNextVideo();
    }
});

let sessionActive = false;
let sessionTimeout;

const curatedList = [
    "Glenn Branca", "John Cage", "Meredith Monk", "Haruomi Hosono", "Ryoji Ikeda",
    "Popol Vuh", "Scott Walker", "Julius Eastman", "Anna von Hausswolff", "Lingua Ignota",
    "Nick Drake", "Talk Talk", "David Sylvian", "Laurie Anderson", "Tim Hecker",
    "Sun Ra", "Can", "Alice Coltrane", "Shakti", "Boris",
    "William Basinski", "Oneohtrix Point Never", "Arca", "Autechre", "Aphex Twin",
    "Moondog", "Daniel Johnston", "Jandek", "Tom Waits", "Arthur Russell",
    "Throbbing Gristle", "Swans", "Death Grips", "Coil", "Current 93"
];

function startSession() {
    if (sessionActive) return;
    sessionActive = true;
    // Stop the session automatically after 10 minutes
    sessionTimeout = setTimeout(stopSession, 10 * 60 * 1000);
    playNextVideo();
}

function stopSession() {
    sessionActive = false;
    clearTimeout(sessionTimeout);
    console.log("YouTube Feed Shuffler session stopped");
}

function playNextVideo() {
    if (!sessionActive) return;

    let artist = curatedList[Math.floor(Math.random() * curatedList.length)];
    let query = encodeURIComponent(artist + " full album");
    let searchUrl = `https://www.youtube.com/results?search_query=${query}`;

    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            let tabId = tabs[0].id;
            browser.tabs.update(tabId, { url: searchUrl }, () => {
                // Wait for page load before injecting the script
                browser.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
                    if (updatedTabId === tabId && changeInfo.status === 'complete') {
                        browser.tabs.onUpdated.removeListener(listener);

                        // Use scripting.executeScript for Chrome and tabs.executeScript for Firefox
                        const executeScript = browser.scripting ?
                            () => browser.scripting.executeScript({
                                target: { tabId },
                                func: interactWithVideos
                            }) :
                            () => browser.tabs.executeScript(tabId, {
                                code: `(${interactWithVideos.toString()})()`
                            });

                        setTimeout(() => {
                            executeScript();
                            // Schedule next video
                            setTimeout(() => {
                                if (sessionActive) {
                                    playNextVideo();
                                }
                            }, 10 * 1000);
                        }, 3000);
                    }
                });
            });
        }
    });
}

function interactWithVideos() {
    let video = document.querySelector("ytd-video-renderer");
    if (video) {
        let thumbnail = video.querySelector("a#thumbnail");
        if (thumbnail) thumbnail.click();
    }
}
