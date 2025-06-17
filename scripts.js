// FIREBASE SETUP

// Import the functions you need from the SDKs you need

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

const postList = document.getElementById("post-list");
const tagSearch = document.getElementById('tag-search');
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
  const tagQuery = document.getElementById("tag-search")?.value.toLowerCase();
  const sortBy = document.getElementById("sort-select")?.value;

  let result = [...posts];

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

// After loading the post content
if (window.location.pathname.includes("author.html")) {
  // ...existing code for author.html if any...
}

// Event listeners for sort and search
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

// Initial render
renderPostList(getFilteredAndSortedPosts());