// ==========================================
// FAQ ACCORDION
// Ebenezer Day Star Academy
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const faqQuestions = document.querySelectorAll(".faq-question");

    faqQuestions.forEach(question => {

        question.addEventListener("click", () => {

            const currentItem = question.closest(".faq-item");

            // Close other FAQ items
            document.querySelectorAll(".faq-item").forEach(item => {

                if (item !== currentItem) {
                    item.classList.remove("active");

                    const button = item.querySelector(".faq-question");

                    if (button) {
                        button.setAttribute("aria-expanded", "false");
                    }
                }

            });

            // Toggle current FAQ
            const isActive = currentItem.classList.toggle("active");

            question.setAttribute(
                "aria-expanded",
                isActive ? "true" : "false"
            );

        });

    });

});