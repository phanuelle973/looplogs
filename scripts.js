// FIREBASE SETUP

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
const db = getFirestore(app);
window.db = db; // Make it global so createLikeButton can access it

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
const analytics = getAnalytics(app);

const authors = {
  Phanuelle: {
    pic: "assets/Phanuelle_Manuel.jpg",
    bio: "Founder of LoopLogs, lover of clean code and coffee ☕",
  },
  "Jamie R.": {
    pic: "assets/jamie.png",
    bio: "CS major, hackathon addict, big fan of VS Code themes.",
  },
};

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
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
