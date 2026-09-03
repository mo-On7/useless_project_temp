const status =
    document.getElementById("status");

const toggleButton =
    document.getElementById("toggleButton");


async function updateDisplay() {

    const data =
        await chrome.storage.local.get(
            "strangebaitState"
        );

    const state =
        data.strangebaitState;


    if (
        state &&
        state.prankState !== "DONE"
    ) {

        status.textContent =
            "Status: ON";

        toggleButton.textContent =
            "TURN OFF";

    }

    else {

        status.textContent =
            "Status: OFF";

        toggleButton.textContent =
            "TURN ON";

    }

}


toggleButton.addEventListener(

    "click",

    async function () {

        const data =
            await chrome.storage.local.get(
                "strangebaitState"
            );

        const state =
            data.strangebaitState;


        if (
            state &&
            state.prankState !== "DONE"
        ) {

            await chrome.runtime.sendMessage({

                action:
                    "DEACTIVATE_STRANGEBAIT"

            });

        }

        else {

            await chrome.runtime.sendMessage({

                action:
                    "ACTIVATE_STRANGEBAIT"

            });

        }


        updateDisplay();

    }

);


updateDisplay();