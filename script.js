const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");

const syncHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

menuButton.addEventListener("click", () => {
  header.classList.toggle("is-open");
});

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("is-open");
  });
});

const form = document.querySelector("[data-contact-form]");

if (form) {
  const status = form.querySelector("[data-form-status]");
  const submit = form.querySelector("[data-submit]");
  const submitLabel = submit.textContent;
  const required = form.querySelectorAll("[required]");

  const setStatus = (message, state) => {
    status.textContent = message;
    status.classList.toggle("is-error", state === "error");
    status.classList.toggle("is-success", state === "success");
  };

  required.forEach((field) => {
    field.addEventListener("input", () => field.classList.remove("is-invalid"));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    let firstInvalid = null;
    required.forEach((field) => {
      const valid = field.checkValidity() && field.value.trim() !== "";
      field.classList.toggle("is-invalid", !valid);
      if (!valid && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      setStatus("Please complete the required fields.", "error");
      firstInvalid.focus();
      return;
    }

    // If the Formspree endpoint hasn't been set yet, fall back to opening the
    // visitor's email client so no enquiry is ever lost.
    if (form.action.includes("YOUR_FORM_ID")) {
      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const org = form.elements.organization.value.trim();
      const type = form.elements.engagement_type.value;
      const message = form.elements.message.value.trim();
      const body = `Name: ${name}\nEmail: ${email}\nOrganization: ${org}\nEngagement: ${type}\n\n${message}`;
      window.location.href = `mailto:girideepsingh@gmail.com?subject=${encodeURIComponent(
        "Consulting enquiry — " + name
      )}&body=${encodeURIComponent(body)}`;
      setStatus("Opening your email app to send the enquiry…", "success");
      return;
    }

    submit.disabled = true;
    submit.textContent = "Sending…";
    setStatus("", null);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        form.reset();
        setStatus("Thank you — your enquiry has been sent. Girideep will be in touch.", "success");
      } else {
        setStatus("Something went wrong. Please email girideepsingh@gmail.com directly.", "error");
      }
    } catch (error) {
      setStatus("Network error. Please email girideepsingh@gmail.com directly.", "error");
    } finally {
      submit.disabled = false;
      submit.textContent = submitLabel;
    }
  });
}
