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

const authors = {
  Phanuelle: {
    pic: "assets/authors/Phanuelle_Manuel.jpg",
    bio: "Founder of LoopLogs, lover of clean code and coffee ☕",
  },
  "Jamie R.": {
    pic: "assets/jamie.png",
    bio: "CS major, hackathon addict, big fan of VS Code themes.",
  },
};

// END FIREBASE SETUP

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

const postList = document.getElementById("post-list");

posts.forEach((post) => {
  const el = document.createElement("div");
  el.className = "post-preview";

  const title = document.createElement("h2");
  const link = document.createElement("a");
  link.href = post.link;
  link.textContent = post.title;
  title.appendChild(link);

  const meta = document.createElement("p");
  meta.textContent = `By ${post.author} · ${post.date}`;

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
});

// ❤️ Like button logic

async function createLikeButton(postId) {
  const db = window.db;
  const safeId = postId.replace(/\W+/g, "_");
  const docRef = doc(db, "likes", safeId);
  const docSnap = await getDoc(docRef);

  let count = 0;
  if (docSnap.exists()) {
    count = docSnap.data().count || 0;
  } else {
    await setDoc(docRef, { count: 0 });
  }

  const btn = document.createElement("button");
  btn.className = "like-button";
  btn.textContent = `❤️ Like (${count})`;

  btn.onclick = async () => {
    await updateDoc(docRef, {
      count: increment(1),
    });

    const newSnap = await getDoc(docRef);
    const newCount = newSnap.data().count;
    btn.textContent = `❤️ Like (${newCount})`;
  };

  return btn;
}

// After loading the post content
const postAuthorId = posts.author; // e.g., "phanuelle"

fetch("authors.json")
  .then((res) => res.json())
  .then((authors) => {
    const author = authors[postAuthorId];
    if (!author) return;

    const box = document.getElementById("author-box");
    box.innerHTML = `
      <div class="author-profile">
        <img src="${author.image}" alt="${author.name}" class="author-img">
        <div>
          <h3>${author.name}</h3>
          <p>${author.bio}</p>
          ${
            author.link
              ? `<a href="${author.link}" target="_blank">More</a>`
              : ""
          }
        </div>
      </div>
    `;
  });

const authorParams = new URLSearchParams(window.location.search);
const authorId = authorParams.get("id");

if (authorId) {
  fetch("authors.json")
    .then((res) => res.json())
    .then((data) => {
      const author = data[authorId];
      if (!author) return;

      const section = document.getElementById("author-profile-page");
      section.innerHTML = `
        <div class="author-full-profile">
          <img src="${author.image}" class="author-img-large" />
          <h1>${author.name}</h1>
          <p>${author.bio}</p>
          ${
            author.link
              ? `<a href="${author.link}" target="_blank">Visit Profile</a>`
              : ""
          }
        </div>
      `;
    });
}
