const STATES = {
    WAITING: "WAITING",
    COUNTING: "COUNTING",
    PRANKING: "PRANKING",
    BLOCKED: "BLOCKED",
    DONE: "DONE"
};

const STRANGEBAIT_PRANK_ALARM =
    "strangebait-prank";

const STRANGEBAIT_UNBLOCK_ALARM =
    "strangebait-unblock";


const DEFAULT_STATE = {
    prankState: STATES.DONE,

    targetHost: null,
    targetTabId: null,

    triggerAt: 0,
    blockUntil: 0,

    targetUrl: null
};


// --------------------------------------------------
// STORAGE
// --------------------------------------------------

async function getState() {

    const data =
        await chrome.storage.local.get(
            "strangebaitState"
        );

    return (
        data.strangebaitState ||
        DEFAULT_STATE
    );
}


async function setState(newState) {

    await chrome.storage.local.set({
        strangebaitState: newState
    });
}


// --------------------------------------------------
// WEBSITE CHECK
// --------------------------------------------------

function isNormalWebsite(url) {

    if (!url) {
        return false;
    }

    try {

        const parsed =
            new URL(url);

        return (
            parsed.protocol === "http:" ||
            parsed.protocol === "https:"
        );

    } catch {

        return false;
    }
}


function normalizeHost(host) {

    return host
        .toLowerCase()
        .replace(/^www\./, "");
}


function sameSite(host1, host2) {

    if (!host1 || !host2) {
        return false;
    }

    host1 =
        normalizeHost(host1);

    host2 =
        normalizeHost(host2);

    return (
        host1 === host2 ||
        host1.endsWith("." + host2) ||
        host2.endsWith("." + host1)
    );
}


// --------------------------------------------------
// MESSAGES
// --------------------------------------------------

chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {

        // ------------------------------------------
        // ACTIVATE
        // ------------------------------------------

        if (
            message.action ===
            "ACTIVATE_STRANGEBAIT"
        ) {

            await chrome.alarms.clear(
                STRANGEBAIT_PRANK_ALARM
            );

            await chrome.alarms.clear(
                STRANGEBAIT_UNBLOCK_ALARM
            );

            await setState({

                prankState:
                    STATES.WAITING,

                targetHost:
                    null,

                targetTabId:
                    null,

                triggerAt:
                    0,

                blockUntil:
                    0,

                targetUrl:
                    null
            });

            console.log(
                "stRAnGEBAIT activated."
            );

            return;
        }


        // ------------------------------------------
        // START TIMER
        // ------------------------------------------

        if (
            message.action ===
            "PAGE_READY"
        ) {

            const state =
                await getState();

            if (
                state.prankState !==
                STATES.WAITING
            ) {
                return;
            }


            const randomDelay =
                Math.floor(
                    Math.random() * 61
                ) + 60;


            const triggerAt =
                Date.now() +
                randomDelay * 1000;


            await setState({

                prankState:
                    STATES.COUNTING,

                targetHost:
                    null,

                targetTabId:
                    null,

                triggerAt:
                    triggerAt,

                blockUntil:
                    0,

                targetUrl:
                    null
            });


            await chrome.alarms.create(
                STRANGEBAIT_PRANK_ALARM,
                {
                    when: triggerAt
                }
            );


            console.log(
                "stRAnGEBAIT timer started."
            );

            console.log(
                "Prank starts in:",
                randomDelay,
                "seconds."
            );

            return;
        }


        // ------------------------------------------
        // ANIMATION FINISHED
        // ------------------------------------------

        if (
            message.action ===
            "STRANGEBAIT_ANIMATION_FINISHED"
        ) {

            const state =
                await getState();

            if (
                state.prankState !==
                STATES.PRANKING
            ) {
                return;
            }


            await startBlock(
                state.targetHost
            );

            return;
        }


        // ------------------------------------------
        // BLOCK EXPIRED
        // ------------------------------------------

        if (
            message.action ===
            "STRANGEBAIT_BLOCK_EXPIRED"
        ) {

            const state =
                await getState();

            if (
                state.prankState ===
                    STATES.BLOCKED &&
                Date.now() >=
                    state.blockUntil
            ) {

                await finishBlock();
            }

            return;
        }
    }
);


// --------------------------------------------------
// ALARMS
// --------------------------------------------------

chrome.alarms.onAlarm.addListener(
    async (alarm) => {

        // ------------------------------------------
        // PRANK ALARM
        // ------------------------------------------

        if (
            alarm.name ===
            STRANGEBAIT_PRANK_ALARM
        ) {

            const state =
                await getState();


            if (
                state.prankState !==
                STATES.COUNTING
            ) {
                return;
            }


            if (
                Date.now() <
                state.triggerAt
            ) {
                return;
            }


            // --------------------------------------
            // FIND CURRENT ACTIVE TAB
            // --------------------------------------

            const tabs =
                await chrome.tabs.query({
                    active: true,
                    lastFocusedWindow: true
                });


            if (
                !tabs ||
                tabs.length === 0
            ) {

                console.log(
                    "No active tab found."
                );

                return;
            }


            const activeTab =
                tabs[0];


            // --------------------------------------
            // CHECK URL
            // --------------------------------------

            if (
                !activeTab.url ||
                !isNormalWebsite(
                    activeTab.url
                )
            ) {

                console.log(
                    "Active tab is not a normal website."
                );

                return;
            }


            // --------------------------------------
            // GET CURRENT WEBSITE
            // --------------------------------------

            let parsedUrl;

            try {

                parsedUrl =
                    new URL(
                        activeTab.url
                    );

            } catch {

                return;
            }


            const targetHost =
                normalizeHost(
                    parsedUrl.hostname
                );


            // --------------------------------------
            // SAVE CURRENT WEBSITE
            // --------------------------------------

            await setState({

                ...state,

                prankState:
                    STATES.PRANKING,

                targetHost:
                    targetHost,

                targetTabId:
                    activeTab.id,

                targetUrl:
                    activeTab.url
            });


            console.log(
                "stRAnGEBAIT target website:",
                targetHost
            );


            // --------------------------------------
            // START PRANK
            // --------------------------------------

            try {

                await chrome.tabs.sendMessage(
                    activeTab.id,
                    {
                        action:
                            "START_STRANGEBAIT_PRANK"
                    }
                );

                console.log(
                    "stRAnGEBAIT prank started."
                );

            } catch (error) {

                console.log(
                    "Could not contact content script:",
                    error
                );
            }

            return;
        }


        // ------------------------------------------
        // UNBLOCK ALARM
        // ------------------------------------------

        if (
            alarm.name ===
            STRANGEBAIT_UNBLOCK_ALARM
        ) {

            const state =
                await getState();


            if (
                state.prankState !==
                STATES.BLOCKED
            ) {
                return;
            }


            if (
                Date.now() >=
                state.blockUntil
            ) {

                await finishBlock();
            }
        }
    }
);


// --------------------------------------------------
// START BLOCK
// --------------------------------------------------

async function startBlock(host) {

    const BLOCK_TIME =
        2 * 60 * 1000;


    const blockUntil =
        Date.now() +
        BLOCK_TIME;


    const state =
        await getState();


    await setState({

        ...state,

        prankState:
            STATES.BLOCKED,

        targetHost:
            host,

        blockUntil:
            blockUntil
    });


    await chrome.alarms.create(
        STRANGEBAIT_UNBLOCK_ALARM,
        {
            when: blockUntil
        }
    );


    console.log(
        "stRAnGEBAIT website blocked for 2 minutes."
    );
}


// --------------------------------------------------
// FINISH BLOCK
// --------------------------------------------------

async function finishBlock() {

    const state =
        await getState();


    await setState({

        ...state,

        prankState:
            STATES.DONE,

        targetHost:
            null,

        targetTabId:
            null,

        triggerAt:
            0,

        blockUntil:
            0
    });


    console.log(
        "stRAnGEBAIT finished permanently."
    );
}


// --------------------------------------------------
// REDIRECT BLOCKED WEBSITE
// --------------------------------------------------

chrome.tabs.onUpdated.addListener(
    async (tabId, changeInfo, tab) => {

        if (!tab.url) {
            return;
        }


        const state =
            await getState();


        // ------------------------------------------
        // ONLY WORK WHILE BLOCKED
        // ------------------------------------------

        if (
            state.prankState !==
            STATES.BLOCKED
        ) {
            return;
        }


        // ------------------------------------------
        // CHECK WHETHER 2 MINUTES ARE OVER
        // ------------------------------------------

        if (
            Date.now() >=
            state.blockUntil
        ) {

            await finishBlock();

            return;
        }


        // ------------------------------------------
        // ONLY NORMAL WEBSITES
        // ------------------------------------------

        if (
            !isNormalWebsite(
                tab.url
            )
        ) {
            return;
        }


        // ------------------------------------------
        // GET CURRENT HOST
        // ------------------------------------------

        let currentHost;

        try {

            currentHost =
                normalizeHost(
                    new URL(
                        tab.url
                    ).hostname
                );

        } catch {

            return;
        }


        // ------------------------------------------
        // CHECK AGAINST BLOCKED WEBSITE
        // ------------------------------------------

        if (
            !sameSite(
                currentHost,
                state.targetHost
            )
        ) {
            return;
        }


        // ------------------------------------------
        // REDIRECT TO ERROR PAGE
        // ------------------------------------------

        const errorPage =
            chrome.runtime.getURL(
                "error.html"
            ) +
            "?returnUrl=" +
            encodeURIComponent(
                tab.url
            );


        try {

            await chrome.tabs.update(
                tabId,
                {
                    url: errorPage
                }
            );

        } catch (error) {

            console.log(
                "Redirect failed:",
                error
            );
        }

    }
);