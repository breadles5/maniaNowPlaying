document.addEventListener("DOMContentLoaded", () => {
  const scrollContainers = document.querySelectorAll(".scroll-container");

  const checkOverflow = (scrollText, container) => {
    const textContainer = container.querySelector(".text-container");
    const isOverflowing = scrollText.scrollWidth > container.clientWidth;

    if (isOverflowing) {
      if (!textContainer.querySelector(".duplicate")) {
      const duplicatedText = scrollText.cloneNode(true);
      duplicatedText.classList.add("duplicate");
      textContainer.appendChild(duplicatedText);
      } else {
      const duplicate = textContainer.querySelector(".duplicate");
      if (duplicate.textContent !== scrollText.textContent) {
        duplicate.textContent = scrollText.textContent;
      }
      }
      textContainer.classList.add("scrolling");
    } else {
      const duplicate = textContainer.querySelector(".duplicate");
      if (duplicate) {
      duplicate.remove();
      }
      textContainer.style.animationDuration = ""; // Reset animation duration
      textContainer.classList.remove("scrolling");
    }
    };

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        const scrollText = mutation.target.nodeType === 3 ? mutation.target.parentElement : mutation.target;
        checkOverflow(scrollText, scrollText.closest(".scroll-container"));
      }
    }
  });

  const config = { childList: true, characterData: true, subtree: true };

  for (const container of scrollContainers) {
      const scrollText = container.querySelector(".scroll-text");
      checkOverflow(scrollText, container); // Initial check
      observer.observe(container, config); // Start observing
  }

  // Periodically check for overflow
  setInterval(() => {
      for (const text of document.querySelectorAll(".scroll-text")) {
        checkOverflow(text, text.closest(".scroll-container"));
      }
    }, 200);


  window.addEventListener("resize", () => {
    for (const text of document.querySelectorAll(".scroll-text")) {
      checkOverflow(text, text.closest(".scroll-container"));
    }
  });
});
