import gplay from "google-play-scraper";
import axios from "axios";
import { Octokit } from "@octokit/rest";

const gistId = "e886d56531dbcde08aa11c096ab0a219";

async function getOctokit() {
  return new Octokit({
    auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
  });
}

async function updateGist(
  gistId,
  stringContent,
  filename = "comfort-cloud-version",
  description = null,
) {
  try {
    const octokit = await getOctokit();
    const gistData = {
      gist_id: gistId,
      files: {
        [filename]: {
          content: stringContent,
        },
      },
    };
    // Update description only if it is provided.
    if (description) {
      gistData.description = description;
    }

    const response = await octokit.rest.gists.update(gistData);

    if (response.status === 200) {
      console.log(`Gist updated successfully! URL: ${response.data.html_url}`);
      return response.data;
    } else {
      throw new Error("Failed to update Gist.");
    }
  } catch (error) {
    console.error("Error updating Gist:", error);
    throw error;
  }
}
axios.get(`https://api.github.com/gists/${gistId}`).then((gist) => {
  const gist_version = gist.data["files"]["comfort-cloud-version"]["content"];
  gplay.app({ appId: "com.panasonic.ACCsmart" }).then((app) => {
    const gplay_version = `"${app.version}"`;
    if (gplay_version !== gist_version) {
      console.log("New App Version found updating Gist");
      // Update gist here
      updateGist(gistId, gplay_version);
    } else {
      console.log("App Versions are the same");
    }
  });
});
