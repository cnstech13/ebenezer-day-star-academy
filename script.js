/* =========================
   MOBILE MENU
========================= */

const menuBtn =
    document.getElementById("menuBtn");

const navbar =
    document.getElementById("navbar");


if (menuBtn && navbar) {

    menuBtn.addEventListener(
        "click",
        () => {

            navbar.classList.toggle("show");

            menuBtn.classList.toggle("open");

        }
    );


    /* Close mobile menu after clicking a link */

    document
        .querySelectorAll(".navbar a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    navbar.classList.remove("show");

                    menuBtn.classList.remove("open");

                }
            );

        });

}


/* =========================
   DARK MODE
========================= */

const themeBtn =
    document.getElementById("themeBtn");


if (themeBtn) {

    const savedTheme =
        localStorage.getItem("schoolTheme");


    if (savedTheme === "dark") {

        document.body.classList.add("dark");

        themeBtn.textContent = "☀️";

    }


    themeBtn.addEventListener(
        "click",
        () => {

            document.body.classList.toggle("dark");


            const isDark =
                document.body.classList.contains(
                    "dark"
                );


            localStorage.setItem(
                "schoolTheme",
                isDark
                    ? "dark"
                    : "light"
            );


            themeBtn.textContent =
                isDark
                    ? "☀️"
                    : "🌙";

        }
    );

}


/* =========================
   CURRENT YEAR
========================= */

const yearElement =
    document.getElementById("year");


if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();

}


/* =========================
   STATISTICS COUNTER
========================= */

const counters =
    document.querySelectorAll(
        "[data-count]"
    );


if (counters.length > 0) {

    const counterObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            !entry.isIntersecting
                        )
                            return;


                        const counter =
                            entry.target;


                        const target =
                            Number(
                                counter.dataset.count
                            );


                        let current = 0;


                        const increment =
                            Math.max(
                                1,
                                Math.ceil(
                                    target / 60
                                )
                            );


                        const updateCounter =
                            () => {

                                current +=
                                    increment;


                                if (
                                    current >=
                                    target
                                ) {

                                    counter.textContent =
                                        target;

                                    return;

                                }


                                counter.textContent =
                                    current;


                                requestAnimationFrame(
                                    updateCounter
                                );

                            };


                        updateCounter();


                        counterObserver.unobserve(
                            counter
                        );

                    }
                );

            },
            {
                threshold: 0.5
            }
        );


    counters.forEach(
        counter => {

            counterObserver.observe(
                counter
            );

        }
    );

}


/* =========================
   CONTACT FORM
   WEB3FORMS + SWEETALERT2
========================= */

const contactForm =
    document.getElementById(
        "contactForm"
    );


if (contactForm) {

    contactForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            /* =========================
               GET FORM VALUES
            ========================= */

            const name =
                document
                    .getElementById("name")
                    ?.value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    ?.value
                    .trim();


            const subject =
                document
                    .getElementById("subject")
                    ?.value
                    .trim();


            const message =
                document
                    .getElementById("message")
                    ?.value
                    .trim();


            /* =========================
               VALIDATION
            ========================= */

            if (
                !name ||
                !email ||
                !subject ||
                !message
            ) {

                showWarning(
                    "Incomplete Form",
                    "Please fill in all required fields."
                );

                return;

            }


            /* =========================
               EMAIL VALIDATION
            ========================= */

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(email)
            ) {

                showWarning(
                    "Invalid Email",
                    "Please enter a valid email address."
                );

                return;

            }


            /* =========================
               WEB3FORMS DATA
            ========================= */

            const formData =
    new FormData(contactForm);


            

            formData.append(
                "name",
                name
            );


            formData.append(
                "email",
                email
            );


            formData.append(
                "subject",
                subject
            );


            formData.append(
                "message",
                message
            );


            /* =========================
               WEB3FORMS SETTINGS
            ========================= */

            
            try {

                /* =========================
                   SHOW LOADING
                ========================= */

                showLoading(
                    "Sending Message...",
                    "Please wait while your message is being sent."
                );


                /* =========================
                   SEND TO WEB3FORMS
                ========================= */

                const response =
                    await fetch(
                        "https://api.web3forms.com/submit",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                const result =
                    await response.json();


                /* =========================
                   CLOSE LOADING
                ========================= */

                Swal.close();


                /* =========================
                   SUCCESS
                ========================= */

                if (
                    result.success
                ) {

                    contactForm.reset();


                    await showSuccess(
                        "Message Sent!",
                        "Thank you! Your message has been received successfully."
                    );


                    return;

                }




                /* =========================
                   WEB3FORMS ERROR
                ========================= */

                showError(
                    "Message Not Sent",
                    result.message ||
                    "We could not send your message. Please try again."
                );

            }

            catch (error) {

                console.error(
                    "Web3Forms error:",
                    error
                );


                Swal.close();


                showError(
                    "Connection Error",
                    "Unable to send your message. Please check your internet connection and try again."
                );

            }

        }
    );

}
