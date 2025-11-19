// Replace this with your API key
const API_KEY = "AIzaSyC0UxooumFChvlaAcHrVABdC30ahT42ow8";

const checkBtn = document.getElementById("checkBtn");
const clearBtn = document.getElementById("clearBtn");
const claimEl = document.getElementById("claim");
const output = document.getElementById("output");

checkBtn.addEventListener("click", () => {
  const text = claimEl.value.trim();
  if (!text) {
    output.innerText = "Please enter a claim/text to check.";
    return;
  }
  output.innerText = "Checking...";

  // Google Fact Check Tools API endpoint
  const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(text)}&key=${API_KEY}`;

  fetch(url)
    .then(async (res) => {
      if (!res.ok) {
        // Show helpful message for CORS or auth issues
        const txt = await res.text();
        throw new Error(`HTTP ${res.status} - ${res.statusText}\n${txt}`);
      }
      return res.json();
    })
    .then((data) => {
      renderResult(data);
    })
    .catch((err) => {
      console.error(err);
      output.innerText =
        "Error calling API. If you see a CORS or 403/401 error, use the Node.js proxy method (see instructions). \n\n" +
        String(err.message || err);
    });
});

clearBtn.addEventListener("click", () => {
  claimEl.value = "";
  output.innerText = "Cleared.";
});

function renderResult(data) {
  // data may contain claims array
  if (!data || !data.claims || data.claims.length === 0) {
    output.innerText = "No fact-check results found. (No matching verified claims)";
    return;
  }

  // Show top 3 matches
  const items = data.claims.slice(0, 3).map((c, idx) => {
    const text = [];
    text.push(`Match #${idx + 1}`);
    if (c.text) text.push(`Claim text: ${c.text}`);
    if (c.claimant) text.push(`Claimant: ${c.claimant}`);
    if (c.claimReview && c.claimReview.length) {
      // take first review
      const r = c.claimReview[0];
      if (r.title) text.push(`Review title: ${r.title}`);
      if (r.publisher && r.publisher.name) text.push(`Publisher: ${r.publisher.name}`);
      if (r.textualRating) text.push(`Rating: ${r.textualRating}`);
      if (r.url) text.push(`URL: ${r.url}`);
      if (r.appearanceDate) text.push(`Reviewed on: ${r.appearanceDate}`);
    }
    return text.join("\n");
  });

  output.innerText = items.join("\n\n────────\n\n");
}