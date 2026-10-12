// Public Web Analytics beacon identifier, not an account credential.
// Restrict collection to production; previews and local QA do not count as visitors.
if (location.hostname === "partyprint.live") {
  const beacon = document.createElement("script");
  beacon.src = "https://static.cloudflareinsights.com/beacon.min.js";
  beacon.defer = true;
  beacon.dataset.cfBeacon = JSON.stringify({ token: "068dc07b5a644b72ac3629ba76291db0" });
  document.head.append(beacon);
}
