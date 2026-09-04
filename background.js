const REDIRECT_DELAY = 5000;
const TOTAL_TIME = 2 * 60 * 1000;

const activeTabs = new Map();

const EXTENSION_ERROR_PAGE =
    chrome.runtime.getURL("error.html");


function isNormalWebsite(url) {

    if (!url) {
        return false;
    }

    return (
        url.startsWith("http://") ||
        url.startsWith("https://")
    );
}


function isErrorPage(url) {

    if (!url) {
        return false;
    }

    return url.startsWith(
        EXTENSION_ERROR_PAGE
    );
}


function clearTab(tabId) {

    const data =
        activeTabs.get(tabId);

    if (data && data.timeout) {

        clearTimeout(
            data.timeout
        );
    }

    activeTabs.delete(tabId);
}


function startRedirectCycle(
    tabId,
    originalUrl
) {

    clearTab(tabId);

    const startTime =
        Date.now();


    const data = {

        originalUrl: originalUrl,

        startTime: startTime,

        timeout: null
    };


    activeTabs.set(
        tabId,
        data
    );


    scheduleNextRedirect(
        tabId
    );
}


function scheduleNextRedirect(tabId) {

    const data =
        activeTabs.get(tabId);


    if (!data) {
        return;
    }


    const elapsed =
        Date.now() -
        data.startTime;


    const remaining =
        TOTAL_TIME -
        elapsed;


    /*
     * The two-minute period has ended.
     */

    if (remaining <= 0) {

        chrome.tabs.update(
            tabId,
            {
                url: data.originalUrl
            }
        );

        clearTab(tabId);

        return;
    }


    /*
     * Redirect after 5 seconds,
     * unless the 2-minute timer
     * ends first.
     */

    const delay =
        Math.min(
            REDIRECT_DELAY,
            remaining
        );


    data.timeout =
        setTimeout(
            function () {

                const current =
                    activeTabs.get(
                        tabId
                    );


                if (!current) {
                    return;
                }


                const currentElapsed =
                    Date.now() -
                    current.startTime;


                /*
                 * Two minutes have elapsed.
                 */

                if (
                    currentElapsed >=
                    TOTAL_TIME
                ) {

                    chrome.tabs.update(
                        tabId,
                        {
                            url:
                                current.originalUrl
                        }
                    );

                    clearTab(tabId);

                    return;
                }


                /*
                 * Go to the error page.
                 */

                chrome.tabs.update(
                    tabId,
                    {
                        url:
                            EXTENSION_ERROR_PAGE +
                            "?url=" +
                            encodeURIComponent(
                                current.originalUrl
                            )
                    }
                );

            },
            delay
        );
}


/*
 * Detect when a page is opened/loaded.
 */

chrome.tabs.onUpdated.addListener(
    function (
        tabId,
        changeInfo,
        tab
    ) {

        if (
            changeInfo.status !==
            "complete"
        ) {
            return;
        }


        const url =
            tab.url;


        /*
         * Ignore extension pages
         * and browser internal pages.
         */

        if (
            !isNormalWebsite(url)
        ) {
            return;
        }


        /*
         * If this is our error page,
         * keep the existing two-minute
         * cycle alive.
         */

        if (
            isErrorPage(url)
        ) {
            return;
        }


        /*
         * If this tab is already being
         * controlled, don't restart
         * the two-minute timer.
         */

        if (
            activeTabs.has(tabId)
        ) {
            return;
        }


        /*
         * Start the timer for the
         * newly opened website.
         */

        startRedirectCycle(
            tabId,
            url
        );
    }
);


/*
 * When the user closes a tab,
 * clean up its timer.
 */

chrome.tabs.onRemoved.addListener(
    function (tabId) {

        clearTab(tabId);
    }
);