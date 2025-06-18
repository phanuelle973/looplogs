// ⚠️ Replace these values with your own Firebase project details
const FIREBASE_URL = "https://firestore.googleapis.com/v1/projects/looplogs-4a711/databases/(default)/documents/posts";
const FIREBASE_API_KEY = "AIzaSyBDt3Ybm9mjDn5u85MFhVqB0UYDBiQvrJg";

function onFormSubmit(e) {
  const row = e.values;
  const [timestamp, authorName, username, authorEmail, authorBio, title, content, categories, imageBool, authorImage, authorLink] = row;

  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];

  const titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const timestampSuffix = new Date().getTime().toString().slice(-5);
  const filename = `${dateStr}-${titleSlug}-${timestampSuffix}.md`;

  const body = `---
date: "${timestamp}
title: "${title}"
author: "${username}"
content: "${content}
categories: [${categories.split(',').map(tag => `"${tag.trim()}"`).join(', ')}]
---

${content}
`;

  createFileInRepo(filename, body);
  updatePostsJson(title, username, date, categories, filename);
  updateAuthorsJson(username, authorName, authorEmail, authorBio, authorImage, authorLink);
  Logger.log("Done running form logic");

}

function createFileInRepo(filename, content) {
  const token = '';
  const repo = 'phanuelle973/looplogs';
  const path = `posts/${filename}`;

  const url = `https://api.github.com/repos/${repo}/contents/${path}`;

  // Try to check if file exists first
  let sha = null;
  try {
    const check = UrlFetchApp.fetch(url, { headers });
    const data = JSON.parse(check.getContentText());
    sha = data.sha;
  } catch (error) {
    Logger.log("File doesn't exist, creating new.");
  }

  // Build payload
  const payload = {
    message: `Add new post: ${filename}`,
    content: Utilities.base64Encode(content)
  };
  if (sha) payload.sha = sha;

  const options = {
    method: 'PUT',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + token
    },
    payload: JSON.stringify(payload)
  };

  const response = UrlFetchApp.fetch(url, options);





  Logger.log("GitHub Response:");
  Logger.log(response.getResponseCode());
  Logger.log(response.getContentText());

  Logger.log("Creating file in repo...");
  Logger.log("Filename: " + filename);


}


function updateAuthorsJson(username, authorName, authorEmail, authorBio, authorImage, authorLink) {
  const repo = 'phanuelle973/looplogs';
  const path = 'authors.json';
  const token = ''; // Your GitHub token

  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json'
  };

  const getResponse = UrlFetchApp.fetch(`https://api.github.com/repos/${repo}/contents/${path}`, { headers });
  const contentJson = JSON.parse(getResponse.getContentText());
  const content = Utilities.newBlob(Utilities.base64Decode(contentJson.content)).getDataAsString();
  const authors = JSON.parse(content);

  if (!authors[username]) {
    authors[username] = {
      id: username.toLowerCase(),
      username: username,
      name: authorName,
      email: authorEmail,
      bio: authorBio,
      image: authorImage || "https://via.placeholder.com/150",
      link: authorLink,
    };

    const updatedContent = JSON.stringify(authors, null, 2);
    const payload = {
      message: `Add new author: ${username}`,
      content: Utilities.base64Encode(updatedContent),
      sha: contentJson.sha
    };

    const options = {
      method: 'PUT',
      headers,
      contentType: 'application/json',
      payload: JSON.stringify(payload)
    };

    UrlFetchApp.fetch(`https://api.github.com/repos/${repo}/contents/${path}`, options);
  }

  Logger.log("Updating authors JSON...");
  Logger.log("Authors object: " + JSON.stringify(authors));

}



function updatePostsJson(title, username, date, categories, filename) {
  const repo = 'phanuelle973/looplogs';
  const path = 'posts.json';
  const token = ''; // your GitHub token

  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json'
  };

  // Step 1: Try to fetch current posts.json
  let posts = [];
  let sha = null;

  try {
    const getResponse = UrlFetchApp.fetch(`https://api.github.com/repos/${repo}/contents/${path}`, { headers });
    const contentJson = JSON.parse(getResponse.getContentText());
    const content = Utilities.newBlob(Utilities.base64Decode(contentJson.content)).getDataAsString();
    posts = JSON.parse(content);
    sha = contentJson.sha;
  } catch (e) {
    Logger.log("posts.json not found, creating new one");
  }

  // Step 2: Add new post metadata
  posts.push({
    title: title,
    author: username,
    date: date,
    categories: categories.split(',').map(tag => tag.trim()),
    filename: `posts/${filename}`
  });

  const updatedContent = JSON.stringify(posts, null, 2);
  const payload = {
    message: `Add new post to posts.json: ${filename}`,
    content: Utilities.base64Encode(updatedContent),
    sha: sha
  };

  const options = {
    method: 'PUT',
    headers,
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  const response = UrlFetchApp.fetch(url, options);
  Logger.log("Updated posts.json:");
  Logger.log(response.getContentText());
}
