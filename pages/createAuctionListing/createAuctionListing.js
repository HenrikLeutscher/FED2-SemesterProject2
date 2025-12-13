import { AUCTION_LISTINGS_URL } from "/js/config.js";
import { getToken, getApiKey } from "/js/utils/storage.js";

const token = getToken();
const apiKey = getApiKey();

const createListingForm = document.getElementById('create-listing-form');
const endsAtInput = document.getElementById('listing-endsAt');

if (endsAtInput) {
    const now = new Date();
    now.setHours(now.getHours() + 1);

    const minDate = now.toISOString().slice(0,16);
    endsAtInput.min = minDate;
}


createListingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Form Values:
    const title = document.getElementById('listing-title').value;
    const description = document.getElementById('listing-description').value;
    const tagsInput = document.getElementById('listing-tags').value;
    const imgUrl = document.getElementById('listing-media').value;
    const imgAlt = document.getElementById('listing-media-alt').value;
    const endsAtInput = document.getElementById('listing-endsAt').value;
    const createListingBtn = document.getElementById('create-listing-btn');
    const errorMessageDiv = document.getElementById('error-message');
    const successMessageDiv = document.getElementById('success-message');

    const endsDate = new Date(endsAtInput);

    if (endsDate <= new Date()) {
        errorMessageDiv.textContent = "End date must be in the future.";
        createListingBtn.disabled = false;
        createListingBtn.textContent = "Create Listing";
        return;
    }


    createListingBtn.disabled = true;
    createListingBtn.textContent = "Creating your listing...";
    errorMessageDiv.textContent = "";

    const tags = tagsInput ? tagsInput.split(`,`).map(tag => tag.trim()) : [];

    const imgUrls = imgUrl ? imgUrl.split(`\n`).map(url => url.trim()) : [];

    const imgAlts = imgAlt ? imgAlt.split(`\n`).map(alt => alt.trim()) : [];

    const media = imgUrls.map((url, i) => ({
        url,
        alt: imgAlts[i] || "Auction Listing Image"
    }));

    const endsAtIso = new Date(endsAtInput).toISOString();

    // Submitted Data Object for listing
    const listingData = {
        title: title,
        description: description || undefined,
        tags: tags.length > 0 ? tags : undefined,
        media: media.length > 0 ? media : undefined,
        endsAt: endsAtIso
    };

    try {
        const response = await fetch(`${AUCTION_LISTINGS_URL}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "X-Noroff-API-Key": apiKey
            },
            body: JSON.stringify(listingData)
        });

        const data = await response.json();

        if (!response.ok) {
            errorMessageDiv.textContent = data.errors?.[0].message || data.message || "Failed to create listing";
            createListingBtn.disabled = false;
            createListingBtn.textContent = "Create Listing";
            return;
        }

        successMessageDiv.classList.remove("hidden");

        successMessageDiv.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-blue-600 shrink-0" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span class="font-semibold text-lg leading-tight flex items-center">
          Listing created successfully! Redirecting...
        </span>`;
        createListingForm.reset();
        createListingBtn.disabled = false;
        createListingBtn.textContent = "Create Listing";

        setTimeout(() => {
            window.location.href = `/pages/individualauctionlisting/individualauctionlisting.html?id=${data.data.id}`;
        }, 2000);

    } catch (error) {
        errorMessageDiv.textContent = "An error occurred while creating the listing. Please try again.";
    }
});

const imageInput = document.getElementById('listing-media');
const imagePreviewContainer = document.getElementById('image-preview');

if (imageInput && imagePreviewContainer) {
    imageInput.addEventListener("input", () => {
    imagePreviewContainer.classList.remove("hidden");
    const urls = imageInput.value
      .split("\n") // one image per line
      .map(url => url.trim())
      .filter(Boolean);

    if (urls.length === 0) {
        imagePreviewContainer.classList.add("hidden");
    }

    imagePreviewContainer.innerHTML = "";

    urls.forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Preview image";
      img.className = "w-full h-32 object-cover rounded border";

      // Placeholder when link image doesnt work
      img.onerror = () => {
        img.src = "/assets/images/no-image.png";
      };

      imagePreviewContainer.appendChild(img);
    });
  });
}

// Simple counter for description length

const descriptionInput = document.getElementById('listing-description');
const descriptionCounter = document.getElementById('description-counter');

descriptionInput.addEventListener("input", () => {
    descriptionCounter.textContent = descriptionInput.value.length;
});