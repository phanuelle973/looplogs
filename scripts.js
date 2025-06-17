// FIREBASE SETUP

// Import the functions you need from the SDKs you need
// (Make sure these are imported at the top of your HTML or as ES modules if using bundlers)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDt3Ybm9mjDn5u85MFhVqB0UYDBiQvrJg",
  authDomain: "looplogs-4a711.firebaseapp.com",
  projectId: "looplogs-4a711",
  storageBucket: "looplogs-4a711.firebasestorage.app",
  messagingSenderId: "122145076851",
  appId: "1:122145076851:web:afc68cf5c11c2c8ee95c06",
  measurementId: "G-WXD0LKBL8N",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
window.db = db; // so it’s usable globally if needed

// END FIREBASE SETUP

// Post data used for rendering author.html and posts.html
const posts = [
  {
    title: "Welcome to LoopLogs",
    author: "Phanuelle",
    date: "2025-06-15",
    link: "post.html?file=posts/welcome.md",
    tags: ["Reflections"],
  },
  {
    title: "My First Hackathon",
    author: "Jamie R.",
    date: "2025-06-16",
    link: "post.html?file=posts/hackathon.md",
    tags: ["Projects", "Coding Journey"],
  },
];

window.posts = posts;

// DOM elements
const postList = document.getElementById("post-list");
const tagSearch = document.getElementById("tag-search");
const sortDropdown = document.getElementById("sort-select");

// Render the post list
function renderPostList(postArray) {
  if (!postList) return;
  postList.innerHTML = "";
  if (postArray.length === 0) {
    postList.innerHTML = "<p>No posts found.</p>";
    return;
  }
  postArray.forEach((post) => {
    const el = document.createElement("div");
    el.className = "post-preview";

    const title = document.createElement("h2");
    const link = document.createElement("a");
    link.href = post.link;
    link.textContent = post.title;
    title.appendChild(link);

    const meta = document.createElement("p");
    meta.innerHTML = `By <a href="author.html?id=${encodeURIComponent(
      post.author.toLowerCase()
    )}" class="author-link">${post.author}</a> · ${post.date}`;

    const tags = document.createElement("p");
    tags.textContent = post.tags.join(", ");

    el.appendChild(title);
    el.appendChild(meta);
    el.appendChild(tags);

    // Add the like button asynchronously
    createLikeButton(post.link).then((likeBtn) => {
      el.appendChild(likeBtn);
    });

    postList.appendChild(el);
  });
}

// Get filtered and sorted posts
function getFilteredAndSortedPosts() {
  const tagQuery = tagSearch?.value.toLowerCase() || "";
  const sortBy = sortDropdown?.value || "date";

  let result = [...window.posts];

  // FILTER by tag
  if (tagQuery) {
    result = result.filter((post) =>
      post.tags.some((tag) => tag.toLowerCase().includes(tagQuery))
    );
  }

  // SORT
  if (sortBy === "date") {
    // Newest first
    result.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortBy === "likes") {
    // Most liked first (assumes post.likeCount exists; otherwise, all will be 0)
    result.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
  } else if (sortBy === "author") {
    // Author name A-Z
    result.sort((a, b) => a.author.localeCompare(b.author));
  } else if (sortBy === "title") {
    // Title A-Z
    result.sort((a, b) => a.title.localeCompare(b.title));
  }

  return result;
}

// ❤️ Like button logic
async function createLikeButton(postId) {
  const db = getFirestore(app);
  const safeId = btoa(postId); // base64-encode
  const likeRef = doc(db, "likes", safeId);

  let count = 0;
  try {
    const docSnap = await getDoc(likeRef);
    if (docSnap.exists()) {
      count = docSnap.data().count || 0;
    } else {
      await setDoc(likeRef, { count: 0 });
    }
  } catch (e) {
    // handle error if needed
  }

  const btn = document.createElement("button");
  btn.className = "like-button";
  btn.textContent = `❤️ Like (${count})`;

  btn.onclick = async () => {
    await updateDoc(likeRef, {
      count: increment(1),
    });
    const newSnap = await getDoc(likeRef);
    const newCount = newSnap.data().count;
    btn.textContent = `❤️ Like (${newCount})`;
  };

  return btn;
}

// Fetch like counts for all posts and update window.posts
async function fetchLikeCounts(posts) {
  const db = getFirestore(app);
  const updatedPosts = await Promise.all(
    posts.map(async (post) => {
      const safeId = btoa(post.link);
      const likeRef = doc(db, "likes", safeId);
      try {
        const docSnap = await getDoc(likeRef);
        return {
          ...post,
          likeCount: docSnap.exists() ? docSnap.data().count || 0 : 0,
        };
      } catch (e) {
        return { ...post, likeCount: 0 };
      }
    })
  );
  return updatedPosts;
}

// Main logic: fetch like counts, then render and set up event listeners
async function main() {
  // Only run on pages with a post list (posts.html, author.html, etc.)
  if (!postList) return;

  // Fetch like counts and update window.posts
  window.posts = await fetchLikeCounts(posts);

  // Initial render
  renderPostList(getFilteredAndSortedPosts());

  // Re-render on sort or search
  if (sortDropdown) {
    sortDropdown.addEventListener("change", () => {
      renderPostList(getFilteredAndSortedPosts());
    });
  }
  if (tagSearch) {
    tagSearch.addEventListener("input", () => {
      renderPostList(getFilteredAndSortedPosts());
    });
  }
}

let firebasePosts = [];

async function loadPostsFromFirestore() {
  const postList = document.getElementById("post-list");
  if (!postList) return;

  const snapshot = await db.collection("posts").get();
  firebasePosts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate?.() || new Date()  // fallback
  }));

  displayPosts(firebasePosts); // show initially
}

function displayPosts(posts) {
  const postList = document.getElementById("post-list");
  postList.innerHTML = "";

  posts.forEach(data => {
    const post = document.createElement("div");
    post.className = "post-card";
    post.innerHTML = `
      <h2>${data.title}</h2>
      <p>${data.content}</p>
      <p><strong>Author:</strong> ${data.author}</p>
      <p><strong>Tags:</strong> ${data.tags}</p>
      <p><small>${new Date(data.timestamp).toLocaleString()}</small></p>
    `;
    postList.appendChild(post);
  });
}

document.addEventListener("DOMContentLoaded", loadPostsFromFirestore);

async function loadAuthorData(username) {
  const res = await fetch('authors.json');
  const authors = await res.json();
  return authors[username];
}

function getAuthorFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function filterPostsByAuthor(username) {
  return window.posts.filter(
    post => post.author.toLowerCase().replace(/\s/g, '') === username
  );
}

async function renderAuthorPage() {
  const username = getAuthorFromUrl();
  if (!username) return;

  // Load author data
  const author = await loadAuthorData(username);
  if (!author) return;

  // Update author header
  const authorHeader = document.getElementById('author-header');
  if (authorHeader) {
    authorHeader.textContent = `Posts by ${author.name || author.id || username}`;
  }

  // Show author profile
  const profileBox = document.getElementById('author-profile-page');
  if (profileBox) {
    profileBox.innerHTML = `
      <img src="${author.image}" alt="${author.name || author.id}" style="max-width:120px;border-radius:50%;">
      <h2>${author.name || author.id}</h2>
      <p>${author.bio || ''}</p>
      ${author.link ? `<a href="${author.link}" target="_blank">Profile</a>` : ''}
    `;
  }

  // Filter and render posts by this author
  const filteredPosts = window.posts.filter(
    post => post.author.toLowerCase().replace(/\s/g, '') === username
  );
  renderPostList(filteredPosts);
}

if (window.location.pathname.includes('author.html')) {
  main().then(renderAuthorPage);
} else {
  main();
}

// Run main logic
main();