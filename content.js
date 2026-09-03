// --------------------------------------------------
// PAGE READY
// --------------------------------------------------

chrome.runtime.sendMessage({
    action: "PAGE_READY",
    url: window.location.href
});


// --------------------------------------------------
// PRANK STATE
// --------------------------------------------------

let prankStarted = false;


// --------------------------------------------------
// LISTEN FOR PRANK START
// --------------------------------------------------

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


// --------------------------------------------------
// START PRANK
// --------------------------------------------------

function startPrank() {

    const overlay =
        createPrankOverlay();

    const canvas =
        overlay.querySelector(
            "#strangebait-ring-canvas"
        );

    // Start the magical ring
    startMagicalRing(canvas);
}


// --------------------------------------------------
// CREATE PRANK OVERLAY
// --------------------------------------------------

function createPrankOverlay() {

    const overlay =
        document.createElement("div");

    overlay.id =
        "strangebait-prank-overlay";


    // ----------------------------------------------
    // RING CANVAS
    // ----------------------------------------------

    const canvas =
        document.createElement("canvas");

    canvas.id =
        "strangebait-ring-canvas";


    // ----------------------------------------------
    // ADD TO PAGE
    // ----------------------------------------------

    overlay.appendChild(canvas);

    document.body.appendChild(
        overlay
    );


    return overlay;
}


// --------------------------------------------------
// MAGICAL RING
// --------------------------------------------------

function startMagicalRing(canvas) {

    const ctx =
        canvas.getContext("2d");

    const duration = 5000;

    const sparkCount = 300;

    const circleThickness = 18;

    const sparkSpread = 22;

    let centerX = 0;
    let centerY = 0;

    let maxRadius = 0;

    let animationFrame;

    let resizeHandler;


    // --------------------------------------------------
    // RESIZE
    // --------------------------------------------------

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

        centerX =
            window.innerWidth / 2;

        centerY =
            window.innerHeight / 2;

        maxRadius =
            Math.sqrt(
                centerX * centerX +
                centerY * centerY
            );
    }


    resizeHandler =
        resizeCanvas;

    resizeCanvas();

    window.addEventListener(
        "resize",
        resizeHandler
    );


    // --------------------------------------------------
    // CREATE SPARKS
    // --------------------------------------------------

    const sparks = [];

    for (
        let i = 0;
        i < sparkCount;
        i++
    ) {

        sparks.push({

            angle:
                Math.random() *
                Math.PI *
                2,

            offset:
                Math.random(),

            length:
                Math.random() *
                    sparkSpread +
                5,

            size:
                Math.random() *
                    2 +
                0.5,

            brightness:
                Math.random() *
                    0.7 +
                0.3,

            speed:
                Math.random() *
                    0.8 +
                0.4,

            flicker:
                Math.random() *
                Math.PI *
                2,

            curve:
                (Math.random() -
                    0.5) *
                0.8
        });
    }


    // --------------------------------------------------
    // BLACK INSIDE
    // --------------------------------------------------

    function drawBlackInside(radius) {

        radius =
            Math.max(
                0,
                radius
            );

        ctx.save();

        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "rgba(0, 0, 0, 1)";

        ctx.fill();

        ctx.restore();
    }


    // --------------------------------------------------
    // SPARKS
    // --------------------------------------------------

    function drawSparks(
        radius,
        time
    ) {

        radius =
            Math.max(
                0,
                radius
            );

        ctx.save();

        ctx.globalCompositeOperation =
            "lighter";

        for (
            const spark of sparks
        ) {

            const angle =
                spark.angle;

            const distance =
                radius +
                (
                    spark.offset -
                    0.5
                ) *
                sparkSpread;

            const flicker =
                0.5 +
                0.5 *
                Math.sin(
                    time *
                        0.01 *
                        spark.speed +
                    spark.flicker
                );

            const alpha =
                spark.brightness *
                flicker;

            const startX =
                centerX +
                Math.cos(angle) *
                distance;

            const startY =
                centerY +
                Math.sin(angle) *
                distance;

            const endDistance =
                distance +
                spark.length;

            const endX =
                centerX +
                Math.cos(angle) *
                endDistance;

            const endY =
                centerY +
                Math.sin(angle) *
                endDistance;

            const controlDistance =
                distance +
                spark.length *
                0.5;

            const controlAngle =
                angle +
                spark.curve;

            const controlX =
                centerX +
                Math.cos(controlAngle) *
                controlDistance;

            const controlY =
                centerY +
                Math.sin(controlAngle) *
                controlDistance;


            ctx.beginPath();

            ctx.moveTo(
                startX,
                startY
            );

            ctx.quadraticCurveTo(
                controlX,
                controlY,
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

        ctx.restore();
    }


    // --------------------------------------------------
    // MAIN RING
    // --------------------------------------------------

    function drawCircle(radius) {

        radius =
            Math.max(
                0,
                radius
            );

        ctx.save();

        // Outer glow
        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            radius,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "rgba(255,255,255,0.15)";

        ctx.lineWidth =
            circleThickness * 3;

        ctx.shadowBlur = 40;

        ctx.shadowColor =
            "rgba(255,255,255,0.8)";

        ctx.stroke();


        // Main ring
        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            radius,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "rgba(255,255,255,0.95)";

        ctx.lineWidth =
            circleThickness;

        ctx.shadowBlur = 25;

        ctx.shadowColor =
            "rgba(255,255,255,1)";

        ctx.stroke();


        // Bright inner edge
        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            Math.max(
                0,
                radius -
                circleThickness / 2
            ),
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "rgba(255,255,255,0.7)";

        ctx.lineWidth = 3;

        ctx.shadowBlur = 10;

        ctx.stroke();

        ctx.restore();
    }


    // --------------------------------------------------
    // CENTER GLOW
    // --------------------------------------------------

    function drawCenterGlow(radius) {

        radius =
            Math.max(
                0,
                radius
            );

        const gradient =
            ctx.createRadialGradient(
                centerX,
                centerY,
                0,
                centerX,
                centerY,
                Math.max(
                    1,
                    radius
                )
            );

        gradient.addColorStop(
            0,
            "rgba(255,255,255,0.15)"
        );

        gradient.addColorStop(
            0.5,
            "rgba(255,255,255,0.05)"
        );

        gradient.addColorStop(
            1,
            "rgba(255,255,255,0)"
        );

        ctx.save();

        ctx.fillStyle =
            gradient;

        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }


    // --------------------------------------------------
    // FINISH
    // --------------------------------------------------

    function finishRing() {

        cancelAnimationFrame(
            animationFrame
        );

        window.removeEventListener(
            "resize",
            resizeHandler
        );

        setTimeout(() => {

            chrome.runtime.sendMessage({
                action:
                    "STRANGEBAIT_ANIMATION_FINISHED"
            });

        }, 300);
    }


    // --------------------------------------------------
    // ANIMATION
    // --------------------------------------------------

    const startTime =
        performance.now();


    function animate(currentTime) {

        const elapsed =
            currentTime -
            startTime;

        const progress =
            Math.max(
                0,
                Math.min(
                    elapsed /
                        duration,
                    1
                )
            );


        // Smooth expansion
        const expansion =
            0.5 -
            0.5 *
            Math.cos(
                progress *
                Math.PI
            );


        const radius =
            Math.max(
                0,
                maxRadius *
                expansion
            );


        ctx.clearRect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );


        // Black expands from the centre
        drawBlackInside(
            radius
        );


        // Ring
        drawCircle(
            radius
        );


        // Sparks
        drawSparks(
            radius,
            currentTime
        );


        // Centre glow
        drawCenterGlow(
            radius
        );


        if (
            progress >= 1
        ) {

            finishRing();

            return;
        }


        animationFrame =
            requestAnimationFrame(
                animate
            );
    }


    animationFrame =
        requestAnimationFrame(
            animate
        );
}