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
  .sort((a, b) => Number(b.year) - Number(a.year));

    sculptures.forEach((item) => {
      const card = document.createElement("article");
      card.className = "artwork-card";

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