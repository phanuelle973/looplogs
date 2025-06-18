// const posts = [
//   {
//     title: "Welcome to LoopLogs",
//     author: "Phanuelle",
//     date: "2025-06-15",
//     link: "post.html?file=posts/welcome.md",
//     tags: ["Reflections"],
//   },
//   {
//     title: "My First Hackathon",
//     author: "Jamie R.",
//     date: "2025-06-16",
//     link: "post.html?file=posts/hackathon.md",
//     tags: ["Projects", "Coding Journey"],
//   },
// ];

let renderedCount = 0;
const PAGE_SIZE = 6;

// DOM elements
const postList = document.getElementById("post-list");
const tagSearch = document.getElementById("tag-search");
const sortDropdown = document.getElementById("sort-select");

async function fetchPostsJson() {
  const res = await fetch("posts.json");
  const data = await res.json();
  return data;
}

// window.posts = await fetchPostsJson();

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
      post.username.toLowerCase()
    )}" class="author-link">${post.username}</a> · ${post.date}`;

    const tags = document.createElement("p");
    tags.textContent = post.categories.join(", ");

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
      post.categories.some((tag) => tag.toLowerCase().includes(tagQuery))
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
  //   const safeId = btoa(postId); // base64-encode
  //   const likeRef = doc(db, "likes", safeId);

  //   let count = 0;
  //   try {
  //     const docSnap = await getDoc(likeRef);
  //     if (docSnap.exists()) {
  //       count = docSnap.data().count || 0;
  //     } else {
  //       await setDoc(likeRef, { count: 0 });
  //     }
  //   } catch (e) {
  //     console.error("Error fetching like count:", e);
  //   }

  //   const btn = document.createElement("button");
  //   btn.className = "like-button";

  //   const hasLiked = localStorage.getItem(`liked_${safeId}`) === "true";
  //   btn.textContent = hasLiked ? `💔 Unlike (${count})` : `❤️ Like (${count})`;

  //   btn.onclick = async () => {
  //     const alreadyLiked = localStorage.getItem(`liked_${safeId}`) === "true";

  //     try {
  //       if (alreadyLiked) {
  //         await updateDoc(likeRef, { count: increment(-1) });
  //         localStorage.removeItem(`liked_${safeId}`);
  //       } else {
  //         await updateDoc(likeRef, { count: increment(1) });
  //         localStorage.setItem(`liked_${safeId}`, "true");
  //       }

  //       const newSnap = await getDoc(likeRef);
  //       const newCount = newSnap.data().count;

  //       btn.textContent = alreadyLiked
  //         ? `❤️ Like (${newCount})`
  //         : `💔 Unlike (${newCount})`;
  //     } catch (e) {
  //       console.error("Error updating like:", e);
  // }
  //   };
  const btn = document.createElement("button");
  btn.className = "like-button";
  btn.textContent = "❤️ Like";

  return btn;
}

// Fetch like counts for all posts and update window.posts
async function fetchLikeCounts(posts) {
  return posts.map((post) => ({ ...post, likeCount: 0 }));
}

// Main logic: fetch like counts, then render and set up event listeners
async function main() {
  // Only run on pages with a post list (posts.html, author.html, etc.)
  if (!postList) return;

  // Fetch like counts and update window.posts
  let posts = await fetchPostsJson(); // Load from posts.json
  posts = await fetchLikeCounts(posts); // Attach like counts from Firebase RTDB
  window.posts = posts; // Store for access elsewhere

  // Initial render
  renderedCount = 0;
  postList.innerHTML = "";
  window.filteredPosts = getFilteredAndSortedPosts();
  renderNextPage();

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

  window.addEventListener("scroll", () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
      renderedCount < window.filteredPosts.length
    ) {
      renderNextPage();
    }
  });
}

function renderNextPage() {
  const nextPosts = window.filteredPosts.slice(
    renderedCount,
    renderedCount + PAGE_SIZE
  );
  nextPosts.forEach((post) => {
    const el = document.createElement("div");
    el.className = "post-preview";

    const title = document.createElement("h2");
    const link = document.createElement("a");
    link.href = post.link;
    link.textContent = post.title;
    title.appendChild(link);

    const meta = document.createElement("p");
    meta.innerHTML = `By <a href="author.html?id=${encodeURIComponent(
      post.username.toLowerCase()
    )}" class="author-link">${post.username}</a> · ${post.date}`;

    const tags = document.createElement("p");
    tags.textContent = post.categories.join(", ");

    el.appendChild(title);
    el.appendChild(meta);
    el.appendChild(tags);

    createLikeButton(post.link).then((likeBtn) => {
      el.appendChild(likeBtn);
    });

    postList.appendChild(el);
  });

  renderedCount += PAGE_SIZE;
}

function displayPosts(posts) {
  const postList = document.getElementById("post-list");
  postList.innerHTML = "";

  posts.forEach((data) => {
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

async function loadAuthorData(username) {
  const res = await fetch("authors.json");
  const authors = await res.json();
  return authors[username];
}

function getAuthorFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function filterPostsByAuthor(username) {
  return window.posts.filter(
    (post) => post.username.toLowerCase().replace(/\s/g, "") === username
  );
}

async function renderAuthorPage() {
  const username = getAuthorFromUrl();
  if (!username) return;

  // Load author data
  const author = await loadAuthorData(username);
  if (!author) return;

  // Update author header
  const authorHeader = document.getElementById("author-header");
  if (authorHeader) {
    authorHeader.textContent = `Posts by ${
      author.name || author.id || username
    }`;
  }

  // Show author profile
  const profileBox = document.getElementById("author-profile-page");
  if (profileBox) {
    profileBox.innerHTML = `
      <img src="${author.image}" alt="${
      author.name || author.username
    }" style="max-width:120px;border-radius:50%;">
      <h2>@${author.username}</h2>
      <p>${author.bio || ""}</p>
      ${
        author.link
          ? `<a href="${author.link}" target="_blank">Profile</a>`
          : ""
      }
    `;
  }

  // Filter and render posts by this author
  const filteredPosts = window.posts.filter(
    (post) => post.username.toLowerCase().replace(/\s/g, "") === username
  );
  renderPostList(filteredPosts);
}

if (window.location.pathname.includes("author.html")) {
  main().then(renderAuthorPage);
} else {
  main();
}
