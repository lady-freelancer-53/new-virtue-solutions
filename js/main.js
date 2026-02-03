// js/main.js

window.initApp = function () {
  console.log("initApp start");

  // Если jQuery не загрузился — дальше смысла нет
  if (typeof window.jQuery === "undefined") {
    console.error("jQuery is not loaded");
    return;
  }

  // Ждём, когда DOM уже содержит include-вставки (initApp как раз вызывается после них)
  $(function () {
    // ===== Mobile menu =====
    var $header = $("#site-header");
    var $burger = $(".site-header__burger");
    var $closeTargets = $("[data-menu-close]");
    var $body = $("body");

    function openMenu() {
      $header.addClass("is-open");
      $burger.attr("aria-expanded", "true");
      $body.addClass("is-locked");
    }

    function closeMenu() {
      $header.removeClass("is-open");
      $burger.attr("aria-expanded", "false");
      $body.removeClass("is-locked");
    }

    if ($burger.length && $header.length) {
      $burger.on("click", function () {
        if ($header.hasClass("is-open")) closeMenu();
        else openMenu();
      });
    }

    if ($closeTargets.length) {
      $closeTargets.on("click", function () {
        closeMenu();
      });
    }

    $(document).on("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });

    $(".site-header__mobile-link").on("click", function () {
      closeMenu();
    });

    // ===== Services slider =====
    var $services = $(".js-services-slider");

    function equalizeServiceCards() {
      if (!$services.length) return;

      var $cards = $services.find(".service-card");
      $cards.css("min-height", "");

      if (window.innerWidth < 960) return;

      var maxH = 0;
      $cards.each(function () {
        maxH = Math.max(maxH, $(this).outerHeight());
      });

      $cards.css("min-height", maxH + "px");
    }

    //активная ссылка меню в хедер
    function initActiveMenu() {
      const currentPath =
  window.location.pathname.replace(/\/$/, "").split("/").pop() || "index.html";
  
      document.querySelectorAll(".site-header__nav-link").forEach((link) => {
        const href = link.getAttribute("href");
        console.log(href);

        if (href === currentPath) {
          link.classList.add("site-header__nav-link--active");
        } else {
          link.classList.remove("site-header__nav-link--active");
        }
      });
    }

    initActiveMenu();

    if ($services.length) {
      // Если slick не подключён — не валим весь main.js
      if (typeof $services.slick !== "function") {
        console.error("Slick is not loaded");
      } else {
        // ✅ сначала события
        $services
          .on("init", function () {
            equalizeServiceCards();
          })
          .on("setPosition", function () {
            equalizeServiceCards();
          })
          .on("afterChange", function () {
            equalizeServiceCards();
          });

        // ✅ потом инициализация
        if (!$services.hasClass("slick-initialized")) {
          $services.slick({
            slidesToShow: 3,
            slidesToScroll: 1,
            infinite: false,
            arrows: true,
            dots: true,
            speed: 300,
            adaptiveHeight: false,
            responsive: [
              {
                breakpoint: 960,
                settings: {
                  slidesToShow: 1,
                  dots: true,
                  arrows: true,
                },
              },
            ],
          });
        }

        $(window).on("resize", function () {
          equalizeServiceCards();
        });
      }
    }

    // ===== Contact form (оставляю твой код как есть) =====
    (function () {
      const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
      const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
      const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";

      if (window.emailjs) {
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      }

      const form = document.getElementById("contactForm");
      if (!form) return;

      const statusEl = form.querySelector(".contacts-form__status");
      const submitBtn = form.querySelector('button[type="submit"]');

      const nameInput = form.querySelector('input[name="name"]');
      const emailInput = form.querySelector('input[name="email"]');
      const phoneInput = form.querySelector('input[name="phone"]');
      const agreeInput = document.getElementById("agree");

      if (!window.intlTelInput) {
        console.error("intl-tel-input is not loaded");
        return;
      }

      const iti = window.intlTelInput(phoneInput, {
        initialCountry: "auto",
        nationalMode: true,
        separateDialCode: true,
        utilsScript:
          "https://cdn.jsdelivr.net/npm/intl-tel-input@18.5.0/build/js/utils.js",
      });

      function setInvalid(input, message) {
        const field = input.closest(".form-field");
        field.classList.add("is-invalid");
        const err = field.querySelector(".form-error");
        if (err && message) err.textContent = message;
      }

      function clearInvalid(input) {
        const field = input.closest(".form-field");
        field.classList.remove("is-invalid");
      }

      function isEmailValid(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
      }

      function validateName() {
        const v = nameInput.value.trim();
        if (!v) {
          setInvalid(nameInput, "Please enter your name");
          return false;
        }
        clearInvalid(nameInput);
        return true;
      }

      function validateEmail() {
        const v = emailInput.value.trim();
        if (!v) {
          setInvalid(emailInput, "Please enter your email");
          return false;
        }
        if (!isEmailValid(v)) {
          setInvalid(emailInput, "Please enter a valid email");
          return false;
        }
        clearInvalid(emailInput);
        return true;
      }

      function validatePhone() {
        const v = phoneInput.value.trim();
        if (!v) {
          setInvalid(phoneInput, "Please enter your phone number");
          return false;
        }
        if (!iti.isValidNumber()) {
          setInvalid(phoneInput, "Please enter a valid phone number");
          return false;
        }
        clearInvalid(phoneInput);
        return true;
      }

      function validateAgree() {
        return agreeInput.checked;
      }

      function updateButtonState() {
        const ok =
          validateName() &&
          validateEmail() &&
          validatePhone() &&
          validateAgree();
        submitBtn.disabled = !ok;
      }

      [nameInput, emailInput, phoneInput].forEach((input) => {
        input.addEventListener("input", updateButtonState);

        input.addEventListener("blur", () => {
          if (input === nameInput) validateName();
          if (input === emailInput) validateEmail();
          if (input === phoneInput) validatePhone();
          updateButtonState();
        });
      });

      agreeInput.addEventListener("change", updateButtonState);

      phoneInput.addEventListener("countrychange", () => {
        validatePhone();
        updateButtonState();
      });

      submitBtn.disabled = true;

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const ok =
          validateName() &&
          validateEmail() &&
          validatePhone() &&
          validateAgree();

        updateButtonState();
        if (!ok) return;

        statusEl.textContent = "Sending...";

        try {
          const payload = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: iti.getNumber(),
          };

          await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload);

          statusEl.textContent = "";
          form.reset();
          submitBtn.disabled = true;

          [nameInput, emailInput, phoneInput].forEach(clearInvalid);
        } catch (err) {
          statusEl.textContent =
            "Error sending message. Please try again later.";
        }
      });
    })();

    // ===== Scroll to top =====
    (function () {
      const btn = document.getElementById("scrollTopBtn");
      if (!btn) return;

      function toggleButton() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;

        const triggerPoint = docHeight * 0.5;

        if (scrollTop > triggerPoint) btn.classList.add("is-visible");
        else btn.classList.remove("is-visible");
      }

      window.addEventListener("scroll", toggleButton, { passive: true });
      toggleButton();

      btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    })();

    console.log("initApp end");
  });
};
