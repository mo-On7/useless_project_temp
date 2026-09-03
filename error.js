document.addEventListener(
    "DOMContentLoaded",
    function () {

        const canvas =
            document.getElementById("space");

        const ctx =
            canvas.getContext("2d");

        const message =
            document.getElementById("message");

        const title =
            document.getElementById("title");

        const errorCode =
            document.getElementById("errorCode");

        const errorWord =
            document.getElementById("errorWord");

        const subtitle =
            document.getElementById("subtitle");

        const yes =
            document.getElementById("yes");

        const popup =
            document.getElementById("popup");


        const BG = "#24243e";

        const STAR = "#9bc9e8";

        const STAR_SPEED = 0.5;


        /* ==========================================
           BLOCK TIMER / RETURN URL
        ========================================== */

        const params =
            new URLSearchParams(
                window.location.search
            );


        const returnUrl =
            params.get(
                "returnUrl"
            );


        let returnedToOriginalSite =
            false;


        async function monitorBlock() {

            if (!returnUrl) {

                return;

            }


            const checkTimer =

                setInterval(

                    async () => {


                        if (
                            returnedToOriginalSite
                        ) {

                            clearInterval(
                                checkTimer
                            );

                            return;

                        }


                        try {

                            const data =

                                await chrome.storage.local.get(

                                    "strangebaitState"

                                );


                            const state =

                                data.strangebaitState;


                            if (!state) {

                                return;

                            }



                            // --------------------------------
                            // BLOCK IS STILL ACTIVE
                            // --------------------------------

                            if (

                                state.prankState ===

                                "BLOCKED"

                            ) {

                                if (

                                    Date.now() >=

                                    state.blockUntil

                                ) {

                                    returnedToOriginalSite =

                                        true;


                                    clearInterval(

                                        checkTimer

                                    );


                                    window.location.replace(

                                        returnUrl

                                    );

                                }


                                return;

                            }



                            // --------------------------------
                            // BLOCK HAS FINISHED
                            // --------------------------------

                            if (

                                state.prankState ===

                                "DONE"

                            ) {

                                returnedToOriginalSite =

                                    true;


                                clearInterval(

                                    checkTimer

                                );


                                window.location.replace(

                                    returnUrl

                                );

                            }


                        } catch (error) {

                            console.log(

                                "Timer check failed:",

                                error

                            );

                        }

                    },

                    500

                );

        }


        monitorBlock();


        /* ==========================================
           MESSAGES
        ========================================== */

        const messages = [

            {
                title:
                    "404 Error",

                subtitle:
                    "Page not found in this universe..."
            },


            {
                title:
                    "Location detected in another universe",

                subtitle:
                    ""
            },


            {
                title:
                    "Would you like to proceed?",

                subtitle:
                    ""
            }

        ];


        let width = 0;

        let height = 0;


        let stars = [];

        let spiders = [];


        let currentMessage = 0;


        let state =
            "entering";


        let stateStart =
            0;


        /* ==========================================
           TIMING
        ========================================== */

        const ENTER_TIME =
            2000;

        const HOLD_TIME =
            5000;

        const EXIT_TIME =
            2000;


        const MOVING_SPEED =
            1.0;

        const STATIONARY_SPEED =
            0.08;


        /* ==========================================
           RANDOM
        ========================================== */

        function random(
            min,
            max
        ) {

            return Math.random() *
                (max - min) +
                min;

        }


        /* ==========================================
           RESIZE
        ========================================== */

        function resize() {

            const dpr =
                Math.min(
                    window.devicePixelRatio || 1,
                    2
                );


            width =
                window.innerWidth;

            height =
                window.innerHeight;


            canvas.width =
                Math.floor(
                    width * dpr
                );


            canvas.height =
                Math.floor(
                    height * dpr
                );


            canvas.style.width =
                width + "px";


            canvas.style.height =
                height + "px";


            ctx.setTransform(
                dpr,
                0,
                0,
                dpr,
                0,
                0
            );


            createBackground();
        }


        /* ==========================================
           CREATE BACKGROUND
        ========================================== */

        function createBackground() {

            const area =
                width * height;


            const starCount =
                Math.min(
                    420,

                    Math.max(
                        180,

                        Math.floor(
                            area / 6500
                        )
                    )
                );


            stars = [];


            for (
                let i = 0;
                i < starCount;
                i++
            ) {

                stars.push({

                    x:
                        Math.random() *
                        width,

                    y:
                        Math.random() *
                        height,

                    size:
                        Math.random() < 0.82
                            ? 1
                            : 2,

                    alpha:
                        random(
                            0.25,
                            0.9
                        ),

                    twinkle:
                        random(
                            0.3,
                            1.1
                        ),

                    phase:
                        random(
                            0,
                            Math.PI * 2
                        ),

                    drift:
                        random(
                            0.03,
                            STAR_SPEED
                        )
                });
            }


            const spiderCount =
                Math.min(
                    22,

                    Math.max(
                        10,

                        Math.floor(
                            area / 45000
                        )
                    )
                );


            spiders = [];


            for (
                let i = 0;
                i < spiderCount;
                i++
            ) {

                spiders.push({

                    x:
                        Math.random() *
                        width,

                    y:
                        Math.random() *
                        height,

                    scale:
                        random(
                            0.65,
                            1.15
                        ),

                    phase:
                        random(
                            0,
                            Math.PI * 2
                        ),

                    speed:
                        random(
                            0.08,
                            0.22
                        )
                });
            }
        }


        /* ==========================================
           BACKGROUND SPEED
        ========================================== */

        function getBackgroundSpeed() {

            if (
                state === "entering" ||
                state === "exiting"
            ) {

                return MOVING_SPEED;
            }


            return STATIONARY_SPEED;
        }


        /* ==========================================
           STARS
        ========================================== */

        function drawStars(
            time
        ) {

            ctx.save();


            ctx.fillStyle =
                STAR;


            const bgSpeed =
                getBackgroundSpeed();


            for (
                const s of stars
            ) {

                s.x -=
                    s.drift *
                    bgSpeed;


                if (
                    s.x < -4
                ) {

                    s.x =
                        width + 4;
                }


                const pulse =
                    0.72 +

                    Math.sin(
                        time *
                        0.001 *
                        s.twinkle +
                        s.phase
                    ) *
                    0.28;


                ctx.globalAlpha =
                    s.alpha *
                    pulse;


                ctx.fillRect(

                    Math.round(
                        s.x
                    ),

                    Math.round(
                        s.y
                    ),

                    s.size,

                    s.size
                );
            }


            ctx.restore();
        }


        /* ==========================================
           SPIDER
        ========================================== */

        function drawSpider(
            spider,
            time
        ) {

            const bob =
                Math.sin(
                    time *
                    0.001 *
                    spider.speed *
                    8 +
                    spider.phase
                ) *
                1.5;


            const x =
                Math.round(
                    spider.x
                );


            const y =
                Math.round(
                    spider.y +
                    bob
                );


            const u =
                spider.scale;


            ctx.save();


            ctx.translate(
                x,
                y
            );


            ctx.scale(
                u,
                u
            );


            ctx.strokeStyle =
                STAR;


            ctx.fillStyle =
                STAR;


            ctx.globalAlpha =
                0.72;


            ctx.lineWidth =
                1.5;


            ctx.lineCap =
                "square";


            ctx.fillRect(
                -2,
                -3,
                4,
                6
            );


            ctx.fillRect(
                -1,
                -5,
                2,
                2
            );


            const legs = [

                [-3, -2, -8, -6],
                [-3, 0, -9, -1],
                [-3, 2, -8, 6],

                [3, -2, 8, -6],
                [3, 0, 9, -1],
                [3, 2, 8, 6]

            ];


            for (
                const [
                    x1,
                    y1,
                    x2,
                    y2
                ]
                of legs
            ) {

                ctx.beginPath();


                ctx.moveTo(
                    x1,
                    y1
                );


                ctx.lineTo(
                    x2,
                    y2
                );


                ctx.stroke();
            }


            ctx.restore();
        }


        /* ==========================================
           SPIDERS
        ========================================== */

        function drawSpiders(
            time
        ) {

            const bgSpeed =
                getBackgroundSpeed();


            for (
                const spider
                of spiders
            ) {

                spider.x -=
                    spider.speed *
                    4 *
                    bgSpeed;


                if (
                    spider.x < -20
                ) {

                    spider.x =
                        width + 20;


                    spider.y =
                        Math.random() *
                        height;
                }


                drawSpider(
                    spider,
                    time
                );
            }
        }


        /* ==========================================
           BACKGROUND
        ========================================== */

        function drawBackground(
            time
        ) {

            ctx.fillStyle =
                BG;


            ctx.fillRect(
                0,
                0,
                width,
                height
            );


            drawStars(
                time
            );


            drawSpiders(
                time
            );
        }


        /* ==========================================
           EASING
        ========================================== */

        function easeInOutCubic(
            t
        ) {

            return t < 0.5

                ? 4 *
                  t *
                  t *
                  t

                : 1 -
                  Math.pow(
                      -2 * t + 2,
                      3
                  ) / 2;
        }


        /* ==========================================
           SET MESSAGE
        ========================================== */

        function setMessage(
            index
        ) {

            const item =
                messages[index];


            if (
                index === 0
            ) {

                errorCode.textContent =
                    "404";


                errorWord.textContent =
                    " Error";

            }

            else if (
                index === 1
            ) {

                errorCode.textContent =
                    "";


                errorWord.innerHTML =
                    "Location detected in<br>another universe";

            }

            else {

                errorCode.textContent =
                    "";


                errorWord.textContent =
                    item.title;
            }


            subtitle.textContent =
                item.subtitle;


            yes.style.display =
                index === 2
                    ? "block"
                    : "none";


            message.style.transform =
                "translate3d(110vw, -50%, 0)";
        }


        /* ==========================================
           BEGIN MESSAGE
        ========================================== */

        function beginMessage(
            index,
            now
        ) {

            currentMessage =
                index;


            state =
                "entering";


            stateStart =
                now;


            setMessage(
                index
            );
        }


        /* ==========================================
           UPDATE MESSAGE
        ========================================== */

        function updateMessage(
            now
        ) {

            const elapsed =
                now -
                stateStart;


            /* ======================================
               ENTERING
            ====================================== */

            if (
                state === "entering"
            ) {

                const t =
                    Math.min(
                        elapsed /
                        ENTER_TIME,
                        1
                    );


                const eased =
                    easeInOutCubic(
                        t
                    );


                const startX =
                    width * 1.1;


                const x =
                    startX -
                    startX * eased;


                message.style.transform =
                    `translate3d(
                        calc(-50% + ${x}px),
                        -50%,
                        0
                    )`;


                if (
                    t >= 1
                ) {

                    message.style.transform =
                        "translate3d(-50%, -50%, 0)";


                    state =
                        "holding";


                    stateStart =
                        now;
                }


                return;
            }


            /* ======================================
               HOLDING
            ====================================== */

            if (
                state === "holding"
            ) {

                message.style.transform =
                    "translate3d(-50%, -50%, 0)";


                if (
                    elapsed >=
                    HOLD_TIME
                ) {

                    if (
                        currentMessage === 2
                    ) {

                        state =
                            "done";


                        yes.style.display =
                            "block";


                        return;
                    }


                    state =
                        "exiting";


                    stateStart =
                        now;
                }


                return;
            }


            /* ======================================
               EXITING
            ====================================== */

            if (
                state === "exiting"
            ) {

                const t =
                    Math.min(
                        elapsed /
                        EXIT_TIME,
                        1
                    );


                const eased =
                    easeInOutCubic(
                        t
                    );


                const endX =
                    -width * 1.1;


                const x =
                    endX * eased;


                message.style.transform =
                    `translate3d(
                        calc(-50% + ${x}px),
                        -50%,
                        0
                    )`;


                if (
                    t >= 1
                ) {

                    beginMessage(
                        currentMessage + 1,
                        now
                    );
                }


                return;
            }


            /* ======================================
               THIRD MESSAGE
            ====================================== */

            if (
                state === "done"
            ) {

                message.style.transform =
                    "translate3d(-50%, -50%, 0)";


                yes.style.display =
                    "block";


                return;
            }
        }


        /* ==========================================
           ANIMATION
        ========================================== */

        function animate(
            now
        ) {

            drawBackground(
                now
            );


            updateMessage(
                now
            );


            requestAnimationFrame(
                animate
            );
        }


        /* ==========================================
           YES BUTTON
        ========================================== */

        yes.addEventListener(
            "click",
            function () {

                popup.classList.add(
                    "show"
                );

            }
        );


        /* ==========================================
           START
        ========================================== */

        window.addEventListener(
            "resize",
            resize
        );


        resize();


        beginMessage(
            0,
            performance.now()
        );


        requestAnimationFrame(
            animate
        );

    }
);