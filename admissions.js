/* =========================================================
   ADMISSION FORM
   WEB3FORMS + SWEETALERT2
========================================================= */

const admissionForm =
    document.getElementById("admissionForm");


if (admissionForm) {

    admissionForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* =========================================
               GET IMPORTANT FIELDS
            ========================================= */

            const firstName =
                document
                    .getElementById("studentFirstName")
                    ?.value
                    .trim();

            const lastName =
                document
                    .getElementById("studentLastName")
                    ?.value
                    .trim();

            const dob =
                document
                    .getElementById("studentDob")
                    ?.value;

            const gender =
                document
                    .getElementById("studentGender")
                    ?.value;

            const classApplying =
                document
                    .getElementById("classApplying")
                    ?.value;

            const parentName =
                document
                    .getElementById("parentName")
                    ?.value
                    .trim();

            const parentPhone =
                document
                    .getElementById("parentPhone")
                    ?.value
                    .trim();

            const parentEmail =
                document
                    .getElementById("parentEmail")
                    ?.value
                    .trim();

            const relationship =
                document
                    .getElementById("relationship")
                    ?.value;

            const address =
                document
                    .getElementById("address")
                    ?.value
                    .trim();


            /* =========================================
               VALIDATION
            ========================================= */

            if (
                !firstName ||
                !lastName ||
                !dob ||
                !gender ||
                !classApplying ||
                !parentName ||
                !parentPhone ||
                !parentEmail ||
                !relationship ||
                !address
            ) {

                showWarning(
                    "Incomplete Application",
                    "Please complete all required fields before submitting your application."
                );

                return;
            }


            /* =========================================
               EMAIL VALIDATION
            ========================================= */

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailPattern.test(parentEmail)) {

                showWarning(
                    "Invalid Email",
                    "Please enter a valid parent or guardian email address."
                );

                return;
            }


            /* =========================================
               GET ALL FORM DATA
            ========================================= */

            const formData =
                new FormData(admissionForm);


            /* =========================================
               SHOW LOADING
            ========================================= */

            showLoading(
                "Submitting Application...",
                "Please wait while your admission application is being submitted."
            );


            try {

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


                /* =========================================
                   CLOSE LOADING
                ========================================= */

                Swal.close();


                /* =========================================
                   SUCCESS
                ========================================= */

                if (result.success) {

                    admissionForm.reset();


                    await showSuccess(
                        "Application Submitted!",
                        "Thank you! Your child's admission application has been received successfully."
                    );


                    return;
                }


                /* =========================================
                   WEB3FORMS ERROR
                ========================================= */

                showError(
                    "Application Not Submitted",
                    result.message ||
                    "We could not submit your application. Please try again."
                );

            }


            catch (error) {

                console.error(
                    "Web3Forms admission error:",
                    error
                );


                /* =========================================
                   CLOSE LOADING
                ========================================= */

                Swal.close();


                /* =========================================
                   CONNECTION ERROR
                ========================================= */

                showError(
                    "Connection Error",
                    "Unable to connect to the admission service. Please check your internet connection and try again."
                );

            }

        }
    );

}