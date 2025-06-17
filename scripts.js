// FIREBASE SETUP

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
    date: "June 15, 2025",
    link: "post.html?file=posts/welcome.md",
    tags: ["Reflections"],
  },
  {
    title: "My First Hackathon",
    author: "Jamie R.",
    date: "June 16, 2025",
    link: "post.html?file=posts/hackathon.md",
    tags: ["Projects", "Coding Journey"],
  },
];

window.posts = posts;

const postList = document.getElementById("post-list");

if (postList) {
  posts.forEach((post) => {
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
      postList.appendChild(el);
    });
    postList.appendChild(el);
  });
}

// ❤️ Like button logic

function createLikeButton(postId, container) {
  const db = getFirestore(app);
  const safeId = btoa(postId); // base64-encode
  const likeRef = doc(db, "likes", safeId);
  const userLikedKey = `liked_${safeId}`;
  const hasLiked = localStorage.getItem(userLikedKey) === "true";

  const button = document.createElement("button");
  const countSpan = document.createElement("span");
  button.className = "like-button";

  async function updateLikeDisplay() {
    const snap = await getDoc(likeRef);
    const count = snap.exists() ? snap.data().count || 0 : 0;
    countSpan.textContent = `❤️ ${count}`;
    button.classList.toggle(
      "liked",
      localStorage.getItem(userLikedKey) === "true"
    );
  }

  button.appendChild(countSpan);
  updateLikeDisplay();

  button.addEventListener("click", async () => {
    const snap = await getDoc(likeRef);
    let count = snap.exists() ? snap.data().count || 0 : 0;

    if (localStorage.getItem(userLikedKey) === "true") {
      // Unlike
      await setDoc(likeRef, { count: Math.max(0, count - 1) });
      localStorage.removeItem(userLikedKey);
    } else {
      // Like
      await setDoc(likeRef, { count: count + 1 });
      localStorage.setItem(userLikedKey, "true");
    }

    updateLikeDisplay();
  });

  container.appendChild(button);
}

// After loading the post content
if (window.location.pathname.includes("author.html")) {
  const postAuthorId = new URLSearchParams(window.location.search).get("id");

  fetch("authors.json")
    .then((res) => res.json())
    .then((authors) => {
      const author = authors[postAuthorId];
      if (!author) {
        console.error("Author not found:", postAuthorId);
        return;
      }
      const box = document.getElementById("author-box");
      box.innerHTML = `
        <div class="author-profile">
          <img src="${author.image}" alt="${author.id}" class="author-img">
          <div>
            <h3>${author.id}</h3>
            <p>${author.bio}</p>
            ${
              author.link
                ? `<a href="${author.link}" target="_blank">More</a>`
                : ""
            }
          </div>
        </div>
      `;
    })
    .catch((error) => {
      console.error("Failed to load authors.json:", error);
    });
}
