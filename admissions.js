/* =========================================================
   ADMISSION FORM
   WEB3FORMS + SWEETALERT2
   PHILIP / EBENEZER DAY STAR ACADEMY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       GET ADMISSION FORM
    ===================================================== */

    const admissionForm =
        document.getElementById("admissionForm");


    /* =====================================================
       GET CLASS DROPDOWN
    ===================================================== */

    const classApplying =
        document.getElementById("classApplying");


    /* =====================================================
       CLASS LIST
       EACH CLASS APPEARS ONLY ONCE
    ===================================================== */

    const schoolClasses = [
        "Nursery",
        "Primary 1",
        "Primary 2",
        "Primary 3",
        "Primary 4",
        "JSS 1",
        "JSS 2"
    ];


    /* =====================================================
       LOAD CLASS OPTIONS
       CLEAR FIRST TO PREVENT DUPLICATES
    ===================================================== */

    function loadAdmissionClasses() {

        if (!classApplying) {
            return;
        }


        /*
         * IMPORTANT:
         * Clear all existing options before adding
         * the classes again.
         */

        classApplying.innerHTML =
            '<option value="">Select Class</option>';


        /*
         * Use a Set so the same class can never
         * be inserted twice.
         */

        const uniqueClasses =
            [...new Set(schoolClasses)];


        uniqueClasses.forEach(className => {

            const option =
                document.createElement("option");


            option.value =
                className;


            option.textContent =
                className;


            classApplying.appendChild(option);

        });

    }


    /* =====================================================
       LOAD CLASSES ONCE
    ===================================================== */

    loadAdmissionClasses();


    /* =====================================================
       STOP HERE IF FORM DOES NOT EXIST
    ===================================================== */

    if (!admissionForm) {
        return;
    }


    /* =====================================================
       ADMISSION FORM SUBMISSION
    ===================================================== */

    admissionForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* =============================================
               GET IMPORTANT FIELDS
            ============================================= */

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


            const selectedClass =
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


            /* =============================================
               VALIDATION
            ============================================= */

            if (
                !firstName ||
                !lastName ||
                !dob ||
                !gender ||
                !selectedClass ||
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


            /* =============================================
               EMAIL VALIDATION
            ============================================= */

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailPattern.test(parentEmail)) {

                showWarning(
                    "Invalid Email",
                    "Please enter a valid parent or guardian email address."
                );

                return;
            }


            /* =============================================
               PHONE VALIDATION
            ============================================= */

            const phonePattern =
                /^[0-9+\-\s()]{7,20}$/;


            if (!phonePattern.test(parentPhone)) {

                showWarning(
                    "Invalid Phone Number",
                    "Please enter a valid parent or guardian phone number."
                );

                return;
            }


            /* =============================================
               GET ALL FORM DATA
            ============================================= */

            const formData =
                new FormData(admissionForm);


            /* =============================================
               MAKE SURE THE CLASS VALUE IS CORRECT
            ============================================= */

            formData.set(
                "classApplying",
                selectedClass
            );


            /* =============================================
               SHOW LOADING
            ============================================= */

            showLoading(
                "Submitting Application...",
                "Please wait while your admission application is being submitted."
            );


            try {

                /* =========================================
                   SUBMIT TO WEB3FORMS
                ========================================= */

                const response =
                    await fetch(
                        "https://api.web3forms.com/submit",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                /* =========================================
                   CHECK HTTP RESPONSE
                ========================================= */

                if (!response.ok) {

                    throw new Error(
                        `HTTP Error: ${response.status}`
                    );

                }


                /* =========================================
                   READ RESPONSE
                ========================================= */

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


                    /*
                     * Restore the class dropdown
                     * after form.reset()
                     */

                    loadAdmissionClasses();


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

});