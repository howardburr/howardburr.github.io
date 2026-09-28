const categoryByPage = {
  "sculpture.html": "SC",
  "graal-glass.html": "GG",
  "graal-glass-drawings.html": "GGD",
  "drawings.html": "DR",
  "paintings.html": "PT",
  "prints.html": "PR"
};

const folderByCategory = {
  SC: "sculpture",
  GG: "graal-glass",
  GGD: "graal-glass-drawings",
  DR: "drawings",
  PT: "paintings",
  PR: "prints"
};

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

   
   const currentPage = window.location.pathname.split("/").pop();
   const currentCategory = categoryByPage[currentPage];

   const params = new URLSearchParams(window.location.search);
   const selectedSubject =
    currentPage === "selected-subject.html"
    ? params.get("subject")
    : null;

   const galleryItems = artwork
    .filter((item) => {
      const isVisible = item.status !== "hidden";

      if (selectedSubject) {
       const tags = String(item.tags || "")
        .split(",")
        .map((tag) => tag.trim());

       return tags.includes(selectedSubject) && isVisible;
    }

    const isCorrectCategory = item.category === currentCategory;
    return isCorrectCategory && isVisible;
   });


   galleryItems.forEach((item) => {
        const card = document.createElement("a");
card.className = "artwork-card";
card.href = selectedSubject
  ? `artwork.html?id=${encodeURIComponent(item.id)}&subject=${encodeURIComponent(selectedSubject)}`
  : `artwork.html?id=${encodeURIComponent(item.id)}`;

      const image = document.createElement("img");
     const imageFolder = folderByCategory[item.category];
image.src = `images/thumbs/${imageFolder}/${item["image-thumb"]}`;
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
   message.textContent = "The artwork gallery could not be loaded.";

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
    const selectedSubject = params.get("subject");

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

const imageFolder = folderByCategory[item.category];
mainImage.src = `images/main/${imageFolder}/${item["image-main"]}`;

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

// Add category-aware Back to gallery, Previous, and Next navigation.
const categoryPages = {
  SC: "sculpture.html",
  PT: "paintings.html",
  DR: "drawings.html",
  PR: "prints.html",
  GG: "graal-glass.html"
};

const galleryPage = selectedSubject
  ? `selected-subject.html?subject=${encodeURIComponent(selectedSubject)}`
  : categoryPages[item.category];

if (galleryPage) {
  const backLink = document.getElementById("back-to-gallery-link");

  if (backLink) {
    backLink.href = galleryPage;
  }

  let navigationArtwork;

  if (selectedSubject) {
    navigationArtwork = artwork.filter((work) => {
      const tags = String(work.tags || "")
        .split(",")
        .map((tag) => tag.trim());

      return tags.includes(selectedSubject) && work.status !== "hidden";
    });
  } else {
    navigationArtwork = artwork.filter(
      (work) => work.category === item.category && work.status !== "hidden"
    );
  }

  const currentIndex = navigationArtwork.findIndex(
    (work) => work.id === item.id
  );

  if (currentIndex > 0) {
    const previousItem = navigationArtwork[currentIndex - 1];

    const previousLink = document.createElement("a");
    previousLink.href = selectedSubject
      ? `artwork.html?id=${encodeURIComponent(previousItem.id)}&subject=${encodeURIComponent(selectedSubject)}`
      : `artwork.html?id=${encodeURIComponent(previousItem.id)}`;
    previousLink.textContent = "← Back";
    previousLink.className = "artwork-previous";

    artworkDetail.appendChild(previousLink);
  }

  if (
    currentIndex !== -1 &&
    currentIndex < navigationArtwork.length - 1
  ) {
    const nextItem = navigationArtwork[currentIndex + 1];

    const nextLink = document.createElement("a");
    nextLink.href = selectedSubject
      ? `artwork.html?id=${encodeURIComponent(nextItem.id)}&subject=${encodeURIComponent(selectedSubject)}`
      : `artwork.html?id=${encodeURIComponent(nextItem.id)}`;
    nextLink.textContent = "Next →";
    nextLink.className = "artwork-next";

    artworkDetail.appendChild(nextLink);
  }
}


document.title = `${item.title} | Howard Burr`;
const metaDescription = document.querySelector('meta[name="description"]');

if (metaDescription) {
  const categoryNames = {
    SC: "sculpture",
    PT: "painting",
    DR: "drawing",
    PR: "print",
    GG: "graal glass work",
    GGD: "graal glass drawing",
    SK: "sketch"
  };

  const categoryName = categoryNames[item.category] || "artwork";

  let description = `${item.title}`;

  if (item.year) {
    description += `, ${item.year}`;
  }

if (item.category === "GG") {
  description += `, a graal glass vessel by Howard Burr and Burr Graal Glass, Inc.`;
} else {
  description += `, a ${categoryName} by American artist Howard Burr.`;
}

  if (item.materials) {
    description += ` Materials: ${item.materials}.`;
  }

  if (item.dimensions) {
    description += ` Dimensions: ${item.dimensions}.`;
  }

  metaDescription.setAttribute("content", description);
}

  } catch (error) {
    console.error(error);

    const message = document.createElement("p");
    message.className = "gallery-error";
    message.textContent = "This artwork could not be loaded.";

    artworkDetail.appendChild(message);
  }
});