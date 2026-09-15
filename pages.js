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
    document.querySelectorAll("[data-count]");

if (counters.length > 0) {

    const counterObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting)
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
                            Math.ceil(target / 60)
                        );


                    const updateCounter = () => {

                        current += increment;


                        if (current >= target) {

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

                });

            },
            {
                threshold: 0.5
            }
        );


    counters.forEach(counter => {

        counterObserver.observe(
            counter
        );

    });

}


/* =========================
   FAQ ACCORDION
========================= */

const faqQuestions =
    document.querySelectorAll(
        ".faq-question"
    );


faqQuestions.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            const faqItem =
                this.closest(
                    ".faq-item"
                );


            if (!faqItem)
                return;


            const isOpen =
                faqItem.classList.contains(
                    "active"
                );


            /*
             * Close all other FAQ items
             */

            document
                .querySelectorAll(
                    ".faq-item"
                )
                .forEach(item => {

                    item.classList.remove(
                        "active"
                    );


                    const icon =
                        item.querySelector(
                            ".faq-question span:last-child"
                        );


                    if (icon) {

                        icon.textContent =
                            "+";

                    }

                });


            /*
             * Open clicked FAQ
             */

            if (!isOpen) {

                faqItem.classList.add(
                    "active"
                );


                const icon =
                    this.querySelector(
                        "span:last-child"
                    );


                if (icon) {

                    icon.textContent =
                        "−";

                }

            }

        }
    );

});


/* ============================================================
   CONTACT FORM
   WEB3FORMS + SWEETALERT2

   No localStorage
   No Firebase
============================================================ */

const contactForm =
    document.getElementById(
        "contactForm"
    );


if (contactForm) {

    const submitBtn =
        document.getElementById(
            "contactSubmitBtn"
        );


    contactForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* =========================================
               CHECK SUBMIT BUTTON
            ========================================= */

            if (!submitBtn) {

                console.error(
                    "contactSubmitBtn was not found."
                );

                showError(
                    "Form Error",
                    "The submit button could not be found."
                );

                return;

            }


            /* =========================================
               PREVENT DOUBLE SUBMISSION
            ========================================= */

            if (submitBtn.disabled) {
                return;
            }


            /* =========================================
               SAVE ORIGINAL BUTTON CONTENT
            ========================================= */

            const originalButtonHTML =
                submitBtn.innerHTML;


            submitBtn.disabled = true;


            /* =========================================
               SHOW SWEETALERT LOADING
            ========================================= */

            showLoading(
                "Sending Message",
                "Please wait while we send your message..."
            );


            try {

                /* =====================================
                   CREATE FORM DATA
                ===================================== */

                const formData =
                    new FormData(
                        contactForm
                    );


                /* =====================================
                   SEND TO WEB3FORMS
                ===================================== */

                const response =
                    await fetch(
                        "https://api.web3forms.com/submit",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                /* =====================================
                   READ RESPONSE
                ===================================== */

                const result =
                    await response.json();


                /* =====================================
                   SUCCESS
                ===================================== */

                if (
                    response.ok &&
                    result.success
                ) {

                    await showSuccess(
                        "Message Sent Successfully!",
                        "Thank you for contacting Ebenezer Day Star Academy. We will get back to you soon."
                    );


                    /* Clear form */

                    contactForm.reset();

                }


                /* =====================================
                   WEB3FORMS FAILURE
                ===================================== */

                else {

                    showError(
                        "Message Not Sent",
                        result.message ||
                        "Your message could not be sent. Please try again."
                    );

                }

            }


            /* =========================================
               CONNECTION / JAVASCRIPT ERROR
            ========================================= */

            catch (error) {

                console.error(
                    "Web3Forms Error:",
                    error
                );


                showError(
                    "Connection Error",
                    "Unable to send your message. Please check your internet connection and try again."
                );

            }


            /* =========================================
               RESTORE BUTTON
            ========================================= */

            finally {

                submitBtn.disabled =
                    false;


                submitBtn.innerHTML =
                    originalButtonHTML;

            }

        }
    );

}

/* ============================================================
   ADMISSION APPLICATION
   WEB3FORMS + SWEETALERT2

   No localStorage
   No Firebase
============================================================ */

const admissionForm =
    document.querySelector(
        'form[action="https://api.web3forms.com/submit"]'
    );


if (admissionForm) {

    const admissionSubmitBtn =
        document.getElementById(
            "admissionSubmitBtn"
        );


    admissionForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* =========================================
               CHECK BUTTON
            ========================================= */

            if (!admissionSubmitBtn) {

                console.error(
                    "admissionSubmitBtn was not found."
                );

                showError(
                    "Form Error",
                    "The admission submit button could not be found."
                );

                return;

            }


            /* =========================================
               PREVENT DOUBLE SUBMISSION
            ========================================= */

            if (admissionSubmitBtn.disabled) {
                return;
            }


            /* =========================================
               SAVE ORIGINAL BUTTON
            ========================================= */

            const originalButtonHTML =
                admissionSubmitBtn.innerHTML;


            admissionSubmitBtn.disabled =
                true;


            /* =========================================
               SHOW LOADING
            ========================================= */

            showLoading(
                "Submitting Application",
                "Please wait while we submit your admission application..."
            );


            try {

                /* =====================================
                   CREATE FORM DATA
                ===================================== */

                const formData =
                    new FormData(
                        admissionForm
                    );


                /* =====================================
                   SEND TO WEB3FORMS
                ===================================== */

                const response =
                    await fetch(
                        "https://api.web3forms.com/submit",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                /* =====================================
                   GET RESPONSE
                ===================================== */

                const result =
                    await response.json();


                /* =====================================
                   SUCCESS
                ===================================== */

                if (
                    response.ok &&
                    result.success
                ) {

                    await showSuccess(
                        "Application Submitted!",
                        "Your admission application has been submitted successfully. Ebenezer Day Star Academy will contact you regarding the next steps."
                    );


                    /* Clear form */

                    admissionForm.reset();

                }


                /* =====================================
                   FAILURE
                ===================================== */

                else {

                    showError(
                        "Application Not Submitted",
                        result.message ||
                        "Your admission application could not be submitted. Please try again."
                    );

                }

            }


            /* =========================================
               CONNECTION ERROR
            ========================================= */

            catch (error) {

                console.error(
                    "Admission Web3Forms Error:",
                    error
                );


                showError(
                    "Connection Error",
                    "Unable to submit your application. Please check your internet connection and try again."
                );

            }


            /* =========================================
               RESTORE BUTTON
            ========================================= */

            finally {

                admissionSubmitBtn.disabled =
                    false;


                admissionSubmitBtn.innerHTML =
                    originalButtonHTML;

            }

        }
    );

}