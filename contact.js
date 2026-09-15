/* =========================================================
   CONTACT FORM - WEB3FORMS + SWEETALERT2
========================================================= */

const contactForm = document.getElementById("contactForm");

if (contactForm) {

    contactForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        /* ================================
           GET FORM VALUES
        ================================= */

        const name =
            document.getElementById("name")?.value.trim();

        const email =
            document.getElementById("email")?.value.trim();

        const subject =
            document.getElementById("subject")?.value.trim();

        const message =
            document.getElementById("message")?.value.trim();


        /* ================================
           VALIDATION
        ================================= */

        if (!name || !email || !subject || !message) {

            showWarning(
                "Incomplete Form",
                "Please fill in all required fields."
            );

            return;
        }


        /* ================================
           EMAIL VALIDATION
        ================================= */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            showWarning(
                "Invalid Email",
                "Please enter a valid email address."
            );

            return;
        }


        /* ================================
           WEB3FORMS DATA
        ================================= */

        // IMPORTANT:
        // Use the actual form so the access_key
        // and all hidden fields are included.

        const formData =
            new FormData(contactForm);


        /* ================================
           LOADING
        ================================= */

        showLoading(
            "Sending Message...",
            "Please wait while your message is being sent."
        );


        try {

            const response = await fetch(
                "https://api.web3forms.com/submit",
                {
                    method: "POST",
                    body: formData
                }
            );


            const result =
                await response.json();


            /* ================================
               CLOSE LOADING
            ================================= */

            Swal.close();


            /* ================================
               SUCCESS
            ================================= */

            if (result.success) {

                contactForm.reset();

                await showSuccess(
                    "Message Sent!",
                    "Thank you! Your message has been received successfully."
                );

                return;
            }


            /* ================================
               WEB3FORMS ERROR
            ================================= */

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


            /* ================================
               CLOSE LOADING
            ================================= */

            Swal.close();


            /* ================================
               CONNECTION ERROR
            ================================= */

            showError(
                "Connection Error",
                "Unable to connect to Web3Forms. Please check your internet connection and try again."
            );

        }

    });

}