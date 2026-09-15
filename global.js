/* =========================================
   BRIGHT FUTURE ACADEMY
   GLOBAL SCROLL SYSTEM
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * Elements that should animate
         * on every page.
         */

        const elements =
            document.querySelectorAll(
                "section, article, .card, .quick-card, .academic-card, .news-card, .stat, .why-item, .admin-card, .stat-card, .content-card, .table-card, .form-card"
            );


        /*
         * Add the animation class
         */

        elements.forEach(
            function (element) {

                element.classList.add(
                    "scroll-element"
                );

            }
        );


        /*
         * Observe elements while scrolling
         */

        const observer =
            new IntersectionObserver(
                function (entries) {

                    entries.forEach(
                        function (entry) {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "scroll-visible"
                                );


                                /*
                                 * Stop observing after
                                 * the animation has happened.
                                 */

                                observer.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.10
                }
            );


        /*
         * Start observing
         */

        elements.forEach(
            function (element) {

                observer.observe(
                    element
                );

            }
        );

    }
);