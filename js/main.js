$(function () {
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

  $burger.on("click", function () {
    if ($header.hasClass("is-open")) closeMenu();
    else openMenu();
  });

  $closeTargets.on("click", function () {
    closeMenu();
  });

  // Закрытие по Esc
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  // Закрываем меню при переходе по пункту (удобно на мобилке)
  $(".site-header__mobile-link").on("click", function () {
    closeMenu();
  });

  // Services slider
$(".js-services-slider").slick({
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
        arrows: true
      }
    }
  ]
});



function equalizeServiceCards() {
  var $slider = $(".js-services-slider");
  if (!$slider.length) return;

  var $cards = $slider.find(".service-card");

  // сброс
  $cards.css("min-height", "");

  if (window.innerWidth < 960) return;

  var maxH = 0;
  $cards.each(function () {
    maxH = Math.max(maxH, $(this).outerHeight());
  });

  $cards.css("min-height", maxH + "px");
}

// выравниваем после инициализации и после любых перерасчётов
$(".js-services-slider")
  .on("init", function () {
    equalizeServiceCards();
  })
  .on("setPosition", function () {
    equalizeServiceCards();
  })
  .on("afterChange", function () {
    equalizeServiceCards();
  });

// и на ресайз
$(window).on("resize", function () {
  equalizeServiceCards();
});


//Contact form

(function () {
  // ====== CONFIG (cвои значения из EmailJS) ======
  const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
  const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
  const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";

  // Init EmailJS
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

  // Phone picker
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
    // простой и адекватный паттерн для UI-валидации
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

  // Validate on input/blur (чтобы ошибки появлялись под полями)
  [nameInput, emailInput, phoneInput].forEach((input) => {
    input.addEventListener("input", () => {
      // не “ругаемся” агрессивно: если поле пустое — покажем ошибку после blur
      // но кнопку обновляем всегда
      updateButtonState();
    });

    input.addEventListener("blur", () => {
      if (input === nameInput) validateName();
      if (input === emailInput) validateEmail();
      if (input === phoneInput) validatePhone();
      updateButtonState();
    });
  });

  agreeInput.addEventListener("change", updateButtonState);

  // Also validate when country changes
  phoneInput.addEventListener("countrychange", () => {
    validatePhone();
    updateButtonState();
  });

  // Initial
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
        phone: iti.getNumber(), // в международном формате
      };

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload);

      statusEl.textContent = "Thank you! We’ll get back to you soon.";
      form.reset();
      submitBtn.disabled = true;

      // сбрасываем визуальные ошибки
      [nameInput, emailInput, phoneInput].forEach(clearInvalid);
    } catch (err) {
      statusEl.textContent = "Error sending message. Please try again later.";
      // можно console.log для себя
      // console.error(err);
    }
  });
})();


(function () {
  const btn = document.getElementById("scrollTopBtn");
  if (!btn) return;

  function toggleButton() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    // середина страницы
    const triggerPoint = docHeight * 0.5;

    if (scrollTop > triggerPoint) {
      btn.classList.add("is-visible");
    } else {
      btn.classList.remove("is-visible");
    }
  }

  window.addEventListener("scroll", toggleButton, { passive: true });
  toggleButton();

  // плавный скролл наверх
  btn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
})();

  
});
