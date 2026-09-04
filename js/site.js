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