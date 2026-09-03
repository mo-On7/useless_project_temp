let prankStarted = false;


chrome.runtime.onMessage.addListener(
    (message) => {

        if (
            message.action ===
            "START_STRANGEBAIT_PRANK"
        ) {

            if (prankStarted) {
                return;
            }

            prankStarted = true;

            startPrank();
        }
    }
);


chrome.runtime.sendMessage({
    action:
        "PAGE_READY"
});


function startPrank() {

    const overlay =
        createPrankOverlay();


    startMagicalRing(
        overlay.querySelector(
            "#strangebait-ring-canvas"
        ),
        overlay.querySelector(
            "#strangebait-strange-image"
        )
    );
}


function createPrankOverlay() {

    const overlay =
        document.createElement("div");

    overlay.id =
        "strangebait-prank-overlay";


    // ------------------------------------------
    // DOCTOR STRANGE IMAGE
    // ------------------------------------------

    const strangeImage =
        document.createElement("img");


    strangeImage.id =
        "strangebait-strange-image";


    strangeImage.src =
        chrome.runtime.getURL(
            "media/strange.png"
        );


    strangeImage.alt =
        "Doctor Strange";


    overlay.appendChild(
        strangeImage
    );


    // ------------------------------------------
    // MAGICAL RING CANVAS
    // ------------------------------------------

    const canvas =
        document.createElement("canvas");


    canvas.id =
        "strangebait-ring-canvas";


    overlay.appendChild(
        canvas
    );


    document.documentElement.appendChild(
        overlay
    );


    return overlay;
}


function startMagicalRing(
    canvas,
    strangeImage
) {

    const ctx =
        canvas.getContext("2d");


    const duration =
        5000;


    const sparkCount =
        300;


    const circleThickness =
        18;


    const sparkSpread =
        22;


    let animationFrame;

    let startTime = null;


    function resizeCanvas() {

        const dpr =
            Math.min(
                window.devicePixelRatio || 1,
                1.5
            );


        canvas.width =
            window.innerWidth * dpr;


        canvas.height =
            window.innerHeight * dpr;


        canvas.style.width =
            window.innerWidth + "px";


        canvas.style.height =
            window.innerHeight + "px";


        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );
    }


    resizeCanvas();


    window.addEventListener(
        "resize",
        resizeCanvas
    );


    const sparks = [];


    for (
        let i = 0;
        i < sparkCount;
        i++
    ) {

        sparks.push({

            angle:
                Math.random() *
                Math.PI * 2,

            offset:
                Math.random() *
                sparkSpread -
                sparkSpread / 2,

            length:
                Math.random() *
                15 + 5,

            size:
                Math.random() *
                2 + 0.5,

            brightness:
                Math.random() *
                0.7 + 0.3,

            speed:
                Math.random() *
                0.8 + 0.2,

            flicker:
                Math.random() *
                Math.PI * 2,

            curve:
                Math.random() *
                0.5
        });
    }


    function drawBlackInside(
        radius
    ) {

        ctx.beginPath();


        ctx.arc(

            window.innerWidth / 2,

            window.innerHeight / 2,

            Math.max(
                0,
                radius
            ),

            0,

            Math.PI * 2
        );


        ctx.fillStyle =
            "black";


        ctx.fill();
    }


    function drawSparks(
        radius,
        time
    ) {

        const centerX =
            window.innerWidth / 2;


        const centerY =
            window.innerHeight / 2;


        sparks.forEach(
            (spark) => {

                const flicker =
                    0.5 +
                    0.5 *
                    Math.sin(
                        time *
                        0.01 +
                        spark.flicker
                    );


                const alpha =
                    spark.brightness *
                    flicker;


                const sparkRadius =
                    radius +
                    spark.offset;


                const startX =
                    centerX +
                    Math.cos(
                        spark.angle
                    ) *
                    sparkRadius;


                const startY =
                    centerY +
                    Math.sin(
                        spark.angle
                    ) *
                    sparkRadius;


                const endRadius =
                    sparkRadius +
                    spark.length;


                const endX =
                    centerX +
                    Math.cos(
                        spark.angle
                    ) *
                    endRadius;


                const endY =
                    centerY +
                    Math.sin(
                        spark.angle
                    ) *
                    endRadius;


                ctx.beginPath();


                ctx.moveTo(
                    startX,
                    startY
                );


                ctx.lineTo(
                    endX,
                    endY
                );


                ctx.strokeStyle =
                    `rgba(
                        255,
                        255,
                        255,
                        ${alpha}
                    )`;


                ctx.lineWidth =
                    spark.size;


                ctx.stroke();
            }
        );
    }


    function drawCircle(
        radius
    ) {

        const centerX =
            window.innerWidth / 2;


        const centerY =
            window.innerHeight / 2;


        ctx.beginPath();


        ctx.arc(

            centerX,

            centerY,

            Math.max(
                0,
                radius
            ),

            0,

            Math.PI * 2
        );


        ctx.strokeStyle =
            "rgba(255, 255, 255, 0.95)";


        ctx.lineWidth =
            circleThickness;


        ctx.stroke();
    }


    function drawCenterGlow(
        radius
    ) {

        const centerX =
            window.innerWidth / 2;


        const centerY =
            window.innerHeight / 2;


        const gradient =
            ctx.createRadialGradient(

                centerX,
                centerY,
                0,

                centerX,
                centerY,
                Math.max(
                    0,
                    radius
                )
            );


        gradient.addColorStop(
            0,
            "rgba(255,255,255,0.7)"
        );


        gradient.addColorStop(
            0.3,
            "rgba(255,255,255,0.25)"
        );


        gradient.addColorStop(
            1,
            "rgba(255,255,255,0)"
        );


        ctx.fillStyle =
            gradient;


        ctx.beginPath();


        ctx.arc(

            centerX,

            centerY,

            Math.max(
                0,
                radius
            ),

            0,

            Math.PI * 2
        );


        ctx.fill();
    }


    function animate(
        timestamp
    ) {

        if (!startTime) {
            startTime =
                timestamp;
        }


        const elapsed =
            timestamp -
            startTime;


        let progress =
            elapsed /
            duration;


        progress =
            Math.min(
                Math.max(
                    progress,
                    0
                ),
                1
            );


        // --------------------------------------
        // SMOOTH RING EXPANSION
        // --------------------------------------

        const expansion =
            0.5 -
            0.5 *
            Math.cos(
                progress *
                Math.PI
            );


        const centerX =
            window.innerWidth / 2;


        const centerY =
            window.innerHeight / 2;


        const maxRadius =
            Math.sqrt(
                centerX *
                centerX +

                centerY *
                centerY
            );


        const radius =
            maxRadius *
            expansion;


        // --------------------------------------
        // DOCTOR STRANGE FADE
        // --------------------------------------

        if (strangeImage) {

            strangeImage.style.opacity =
                String(
                    1 - progress
                );
        }


        // --------------------------------------
        // CLEAR CANVAS
        // --------------------------------------

        ctx.clearRect(

            0,
            0,

            window.innerWidth,
            window.innerHeight
        );


        // --------------------------------------
        // BLACK CENTER
        // --------------------------------------

        drawBlackInside(
            radius
        );


        // --------------------------------------
        // SPARKS
        // --------------------------------------

        drawSparks(
            radius,
            elapsed
        );


        // --------------------------------------
        // RING
        // --------------------------------------

        drawCircle(
            radius
        );


        // --------------------------------------
        // GLOW
        // --------------------------------------

        drawCenterGlow(
            radius
        );


        if (
            progress < 1
        ) {

            animationFrame =
                requestAnimationFrame(
                    animate
                );

        } else {

            finishRing();
        }
    }


    function finishRing() {

        if (animationFrame) {

            cancelAnimationFrame(
                animationFrame
            );
        }


        window.removeEventListener(
            "resize",
            resizeCanvas
        );


        setTimeout(
            () => {

                chrome.runtime.sendMessage({
                    action:
                        "STRANGEBAIT_ANIMATION_FINISHED"
                });

            },
            300
        );
    }


    animationFrame =
        requestAnimationFrame(
            animate
        );
}