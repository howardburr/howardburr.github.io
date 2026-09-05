document.addEventListener("DOMContentLoaded", async () => {
  const artworkGrid = document.getElementById("artwork-grid");

  // Only run this gallery code on pages that contain #artwork-grid.
  if (!artworkGrid) {
    return;
  }

  try {
    const response = await fetch("data/artwork.json");

    if (!response.ok) {
      throw new Error(`Could not load artwork data: ${response.status}`);
    }

    const artwork = await response.json();

   const sculptures = artwork
  .filter((item) => {
    const isSculpture = item.category === "SC";
    const isVisible = item.status !== "hidden";

    return isSculpture && isVisible;
  })
 .sort((a, b) => {
  // 1. Newest year first.
  const yearDifference = Number(b.year) - Number(a.year);

  if (yearDifference !== 0) {
    return yearDifference;
  }

  const getSortParts = (item) => {
    const id = item.id;

    // Normal IDs:
    // sc-1980-900-a-bride-for-becoming-02
    const normalMatch = id.match(
      /^[a-z]+-\d{4}-(\d{3})-.*?-(\d{2,3})(?:-|$)/i
    );

    if (normalMatch) {
      return {
        sequence: Number(normalMatch[1]),
        itemNumber: Number(normalMatch[2]),
      };
    }

    // Normal ID with no later numbered series item.
    const sequenceMatch = id.match(
      /^[a-z]+-\d{4}-(\d{3})-/i
    );

    if (sequenceMatch) {
      return {
        sequence: Number(sequenceMatch[1]),
        itemNumber: 0,
      };
    }

    // Snowmen are the exception because they omit the 3-digit
    // chronology number:
    // sc-1984-snowmen-03-ah-om
    const snowmanMatch = id.match(
      /^[a-z]+-\d{4}-snowmen-(\d{2})-/i
    );

    if (snowmanMatch) {
      return {
        sequence: 0,
        itemNumber: Number(snowmanMatch[1]),
      };
    }

    return {
      sequence: 0,
      itemNumber: 0,
    };
  };

  const aParts = getSortParts(a);
  const bParts = getSortParts(b);

  // 2. Higher 3-digit chronology number first.
  const sequenceDifference =
    bParts.sequence - aParts.sequence;

  if (sequenceDifference !== 0) {
    return sequenceDifference;
  }

  // 3. Within the same sequence, higher numbered work first.
  return bParts.itemNumber - aParts.itemNumber;
});

    sculptures.forEach((item) => {
        const card = document.createElement("a");
card.className = "artwork-card";
card.href = `artwork.html?id=${encodeURIComponent(item.id)}`;

      const image = document.createElement("img");
      image.src = `images/thumbs/sculpture/${item["image-thumb"]}`;
      image.alt = `${item.title}, ${item.year}`;
      image.loading = "lazy";

      const caption = document.createElement("div");
      caption.className = "artwork-caption";

      const title = document.createElement("h2");
      title.className = "artwork-title";
      title.textContent = item.title;

      const year = document.createElement("p");
      year.className = "artwork-year";
      year.textContent = item.year;

      caption.appendChild(title);
      caption.appendChild(year);

      card.appendChild(image);
      card.appendChild(caption);

      artworkGrid.appendChild(card);
    });
  } catch (error) {
    console.error(error);

    const message = document.createElement("p");
    message.className = "gallery-error";
    message.textContent = "The sculpture gallery could not be loaded.";

    artworkGrid.appendChild(message);
  }
});
document.addEventListener("DOMContentLoaded", async () => {
  const artworkDetail = document.getElementById("artwork-detail");

  // Only run this code on artwork.html.
  if (!artworkDetail) {
    return;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const artworkId = params.get("id");

    if (!artworkId) {
      throw new Error("No artwork ID was provided.");
    }

    const response = await fetch("data/artwork.json");

    if (!response.ok) {
      throw new Error(`Could not load artwork data: ${response.status}`);
    }

    const artwork = await response.json();

    const item = artwork.find((record) => record.id === artworkId);

    if (!item) {
      throw new Error(`Artwork not found: ${artworkId}`);
    }

    const mainImage = document.createElement("img");
    mainImage.className = "artwork-main-image";
    mainImage.src = `images/main/sculpture/${item["image-main"]}`;
    mainImage.alt = `${item.title}, ${item.year}`;

    const info = document.createElement("div");
    info.className = "artwork-info";

    const title = document.createElement("h1");
    title.className = "artwork-detail-title";
    title.textContent = item.title;

    const year = document.createElement("p");
    year.className = "artwork-detail-year";
    year.textContent = item.year;

    const materials = document.createElement("p");
    materials.className = "artwork-detail-materials";
    materials.textContent = item.materials || "";

    const dimensions = document.createElement("p");
    dimensions.className = "artwork-detail-dimensions";
    dimensions.textContent = item.dimensions || "";

    info.appendChild(title);
    info.appendChild(year);

    if (item.materials) {
      info.appendChild(materials);
    }

    if (item.dimensions) {
      info.appendChild(dimensions);
    }

artworkDetail.appendChild(mainImage);
artworkDetail.appendChild(info);

// Add sculpture extra views, if any.
const extraViewKeys = [
  "extra-view-01",
  "extra-view-02",
  "extra-view-03",
  "extra-view-04",
  "extra-view-05",
  "extra-view-06",
];

const extraViews = extraViewKeys
  .map((key) => item[key])
  .filter(Boolean);

if (extraViews.length > 0) {
  const extraSection = document.createElement("section");
  extraSection.className = "artwork-extra-views";

  const extraHeading = document.createElement("h2");
  extraHeading.className = "artwork-section-heading";
  extraHeading.textContent = "Additional Views";

  const extraGrid = document.createElement("div");
  extraGrid.className = "artwork-extra-grid";

  // Create the lightbox.
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("aria-hidden", "true");

  const lightboxImage = document.createElement("img");
  lightboxImage.className = "lightbox-image";
  lightboxImage.alt = "";

  const closeButton = document.createElement("button");
  closeButton.className = "lightbox-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close image");
  closeButton.textContent = "×";

  const previousButton = document.createElement("button");
  previousButton.className = "lightbox-previous";
  previousButton.type = "button";
  previousButton.setAttribute("aria-label", "Previous image");
  previousButton.textContent = "‹";

  const nextButton = document.createElement("button");
  nextButton.className = "lightbox-next";
  nextButton.type = "button";
  nextButton.setAttribute("aria-label", "Next image");
  nextButton.textContent = "›";

  const counter = document.createElement("div");
  counter.className = "lightbox-counter";

  lightbox.appendChild(lightboxImage);
  lightbox.appendChild(closeButton);
  lightbox.appendChild(previousButton);
  lightbox.appendChild(nextButton);
  lightbox.appendChild(counter);

  document.body.appendChild(lightbox);

  let currentExtraIndex = 0;

  const showLightboxImage = (index) => {
    currentExtraIndex = index;

    const filename = extraViews[currentExtraIndex];

    lightboxImage.src =
      `images/extra-images/sculpture/${filename}`;

    lightboxImage.alt =
      `${item.title}, additional view ${currentExtraIndex + 1}`;

    counter.textContent =
      `${currentExtraIndex + 1} / ${extraViews.length}`;
  };

  const openLightbox = (index) => {
    showLightboxImage(index);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    closeButton.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
  };

  const showPreviousImage = () => {
    const newIndex =
      (currentExtraIndex - 1 + extraViews.length) %
      extraViews.length;

    showLightboxImage(newIndex);
  };

  const showNextImage = () => {
    const newIndex =
      (currentExtraIndex + 1) % extraViews.length;

    showLightboxImage(newIndex);
  };

  extraViews.forEach((filename, index) => {
    const imageButton = document.createElement("button");
    imageButton.className = "extra-image-button";
    imageButton.type = "button";
    imageButton.setAttribute(
      "aria-label",
      `Open additional view ${index + 1} of ${item.title}`
    );

    const extraImage = document.createElement("img");
    extraImage.src =
      `images/extra-images/sculpture/${filename}`;
    extraImage.alt =
      `${item.title}, additional view ${index + 1}`;
    extraImage.loading = "lazy";

    imageButton.appendChild(extraImage);

    imageButton.addEventListener("click", () => {
      openLightbox(index);
    });

    extraGrid.appendChild(imageButton);
  });

  closeButton.addEventListener("click", closeLightbox);
  previousButton.addEventListener("click", showPreviousImage);
  nextButton.addEventListener("click", showNextImage);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowLeft") {
      showPreviousImage();
    }

    if (event.key === "ArrowRight") {
      showNextImage();
    }
  });

  extraSection.appendChild(extraHeading);
  extraSection.appendChild(extraGrid);

  artworkDetail.appendChild(extraSection);
}

document.title = `${item.title} | Howard Burr`;

  } catch (error) {
    console.error(error);

    const message = document.createElement("p");
    message.className = "gallery-error";
    message.textContent = "This artwork could not be loaded.";

    artworkDetail.appendChild(message);
  }
});