/* =========================================================
   Ebenezer Day Star Academy
   GLOBAL SWEETALERT2 SYSTEM
========================================================= */


/* =========================================================
   CUSTOM SWEETALERT STYLES
========================================================= */

(function addSweetAlertStyles() {

    if (document.getElementById("pms-sweetalert-styles")) {
        return;
    }

    const style = document.createElement("style");

    style.id = "pms-sweetalert-styles";

    style.textContent = `

        /* ================================
           MAIN POPUP
        ================================= */

        .pms-swal-popup {
            border-radius: 14px !important;
            padding: 35px 30px 30px !important;
            width: min(90%, 520px) !important;
            box-shadow: 0 15px 50px rgba(0, 0, 0, 0.18) !important;
        }


        /* ================================
           TITLE
        ================================= */

        .pms-swal-title {
            font-size: 32px !important;
            font-weight: 700 !important;
            margin-top: 10px !important;
        }


        /* ================================
           MESSAGE
        ================================= */

        .pms-swal-text {
            font-size: 18px !important;
            line-height: 1.5 !important;
            color: #555 !important;
        }


        /* ================================
           BUTTON
        ================================= */

        .pms-swal-confirm {
            border-radius: 7px !important;
            padding: 12px 34px !important;
            font-size: 17px !important;
            font-weight: 600 !important;
            min-width: 105px !important;
            box-shadow: none !important;
        }


        /* ================================
           ICON
        ================================= */

        .pms-swal-icon {
            transform: scale(1.05);
        }


        /* ================================
           MOBILE
        ================================= */

        @media (max-width: 600px) {

            .pms-swal-popup {
                width: calc(100% - 30px) !important;
                padding: 30px 20px 25px !important;
                border-radius: 13px !important;
            }

            .pms-swal-title {
                font-size: 27px !important;
            }

            .pms-swal-text {
                font-size: 17px !important;
            }

            .pms-swal-confirm {
                font-size: 16px !important;
                padding: 11px 30px !important;
            }

        }

    `;

    document.head.appendChild(style);

})();


/* =========================================================
   SUCCESS
========================================================= */

function showSuccess(
    title = "Success!",
    text = ""
) {

    return Swal.fire({

        icon: "success",

        title: title,

        text: text,

        confirmButtonText: "OK",

        confirmButtonColor: "#6c5ce7",

        background: "#ffffff",

        color: "#444",

        allowOutsideClick: false,

        allowEscapeKey: false,

        customClass: {

            popup: "pms-swal-popup",

            title: "pms-swal-title",

            htmlContainer: "pms-swal-text",

            confirmButton: "pms-swal-confirm",

            icon: "pms-swal-icon"

        }

    });

}


/* =========================================================
   ERROR
========================================================= */

function showError(
    title = "Something went wrong",
    text = ""
) {

    return Swal.fire({

        icon: "error",

        title: title,

        text: text,

        confirmButtonText: "OK",

        confirmButtonColor: "#6c5ce7",

        background: "#ffffff",

        color: "#444",

        allowOutsideClick: false,

        allowEscapeKey: false,

        customClass: {

            popup: "pms-swal-popup",

            title: "pms-swal-title",

            htmlContainer: "pms-swal-text",

            confirmButton: "pms-swal-confirm",

            icon: "pms-swal-icon"

        }

    });

}


/* =========================================================
   WARNING
========================================================= */

function showWarning(
    title = "Warning",
    text = ""
) {

    return Swal.fire({

        icon: "warning",

        title: title,

        text: text,

        confirmButtonText: "OK",

        confirmButtonColor: "#6c5ce7",

        background: "#ffffff",

        color: "#444",

        allowOutsideClick: false,

        allowEscapeKey: false,

        customClass: {

            popup: "pms-swal-popup",

            title: "pms-swal-title",

            htmlContainer: "pms-swal-text",

            confirmButton: "pms-swal-confirm",

            icon: "pms-swal-icon"

        }

    });

}


/* =========================================================
   INFO
========================================================= */

function showInfo(
    title = "Information",
    text = ""
) {

    return Swal.fire({

        icon: "info",

        title: title,

        text: text,

        confirmButtonText: "OK",

        confirmButtonColor: "#6c5ce7",

        background: "#ffffff",

        color: "#444",

        allowOutsideClick: false,

        allowEscapeKey: false,

        customClass: {

            popup: "pms-swal-popup",

            title: "pms-swal-title",

            htmlContainer: "pms-swal-text",

            confirmButton: "pms-swal-confirm",

            icon: "pms-swal-icon"

        }

    });

}


/* =========================================================
   LOADING
========================================================= */

function showLoading(
    title = "Please wait...",
    text = "Processing your request..."
) {

    return Swal.fire({

        title: title,

        text: text,

        allowOutsideClick: false,

        allowEscapeKey: false,

        showConfirmButton: false,

        background: "#ffffff",

        color: "#444",

        customClass: {

            popup: "pms-swal-popup",

            title: "pms-swal-title",

            htmlContainer: "pms-swal-text"

        },

        didOpen: () => {

            Swal.showLoading();

        }

    });

}


/* =========================================================
   DELETE CONFIRMATION
========================================================= */

async function confirmDelete(
    title = "Delete this record?",
    text = "This action cannot be undone."
) {

    const result = await Swal.fire({

        icon: "warning",

        title: title,

        text: text,

        showCancelButton: true,

        confirmButtonText: "Yes, Delete",

        cancelButtonText: "Cancel",

        confirmButtonColor: "#d33",

        cancelButtonColor: "#6c757d",

        reverseButtons: true,

        focusCancel: true,

        background: "#ffffff",

        color: "#444",

        allowOutsideClick: false,

        allowEscapeKey: false,

        customClass: {

            popup: "pms-swal-popup",

            title: "pms-swal-title",

            htmlContainer: "pms-swal-text",

            confirmButton: "pms-swal-confirm"

        }

    });

    return result.isConfirmed;

}


/* =========================================================
   MAKE FUNCTIONS AVAILABLE TO ALL PAGE SCRIPTS
========================================================= */

window.showSuccess = showSuccess;
window.showError = showError;
window.showWarning = showWarning;
window.showInfo = showInfo;
window.showLoading = showLoading;
window.confirmDelete = confirmDelete;