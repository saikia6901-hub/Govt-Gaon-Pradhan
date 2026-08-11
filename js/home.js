/* =========================================
   GAON PRADHAN PORTAL
   HOME PAGE JAVASCRIPT
========================================= */


/* =========================================
   MOBILE MENU
========================================= */

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (menuBtn && mobileMenu) {

    menuBtn.addEventListener("click", () => {

        mobileMenu.classList.toggle("active");

        if (mobileMenu.classList.contains("active")) {
            menuBtn.innerHTML = "✕";
        } else {
            menuBtn.innerHTML = "☰";
        }

    });


    // Close menu when a link is clicked

    mobileMenu.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            mobileMenu.classList.remove("active");
            menuBtn.innerHTML = "☰";

        });

    });

}


/* =========================================
   HERO BANNER SLIDER
========================================= */

const hero = document.querySelector(".hero");
const dots = document.querySelectorAll(".slider-dots span");


const banners = [

    "assets/banner1.jpg",
    "assets/banner2.jpg",
    "assets/banner3.jpg",
    "assets/banner4.jpg"

];


let currentBanner = 0;


function changeBanner(index) {

    if (!hero) return;

    currentBanner = index;

    hero.style.backgroundImage =
        `url("${banners[currentBanner]}")`;


    dots.forEach((dot, i) => {

        dot.classList.toggle(
            "active",
            i === currentBanner
        );

    });

}


function nextBanner() {

    currentBanner++;

    if (currentBanner >= banners.length) {
        currentBanner = 0;
    }

    changeBanner(currentBanner);

}


/* Automatic slideshow */

if (hero) {

    setInterval(nextBanner, 5000);

}


/* Manual slider dots */

dots.forEach((dot, index) => {

    dot.addEventListener("click", () => {

        changeBanner(index);

    });

});


/* =========================================
   STATISTICS COUNTER
========================================= */

const counters =
    document.querySelectorAll(".counter");


const counterObserver =
    new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) {
                    return;
                }


                const counter = entry.target;

                const target =
                    Number(counter.dataset.target);


                let current = 0;

                const increment =
                    Math.max(1, Math.ceil(target / 80));


                function updateCounter() {

                    current += increment;


                    if (current >= target) {

                        counter.textContent =
                            target.toLocaleString();

                        return;

                    }


                    counter.textContent =
                        current.toLocaleString();


                    requestAnimationFrame(
                        updateCounter
                    );

                }


                updateCounter();


                counterObserver.unobserve(counter);

            });

        },
        {
            threshold: 0.5
        }
    );


counters.forEach(counter => {

    counterObserver.observe(counter);

});


/* =========================================
   TRACK APPLICATION
========================================= */

const trackForm =
    document.getElementById("trackForm");

const trackResult =
    document.getElementById("trackResult");


if (trackForm) {

    trackForm.addEventListener("submit", event => {

        event.preventDefault();


        const applicationNumber =
            document
                .getElementById("applicationNumber")
                .value
                .trim();


        if (!applicationNumber) {

            trackResult.innerHTML =
                "⚠️ Please enter your Application Reference Number.";

            return;

        }


        /*
         * Firebase connection will be added later.
         *
         * For now we display a temporary message.
         */


        trackResult.innerHTML =
            "🔎 Searching application...";


        setTimeout(() => {

            trackResult.innerHTML =
                "ℹ️ Application tracking system will be connected with Firebase in the next step.";

        }, 700);

    });

}


/* =========================================
   SMOOTH SCROLL
========================================= */

document.querySelectorAll(
    'a[href^="#"]'
).forEach(link => {

    link.addEventListener("click", event => {

        const targetId =
            link.getAttribute("href");

        if (targetId === "#") {
            return;
        }


        const target =
            document.querySelector(targetId);


        if (target) {

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    });

});


/* =========================================
   PAGE READY
========================================= */

console.log(
    "Gaon Pradhan Home Page loaded successfully."
);
