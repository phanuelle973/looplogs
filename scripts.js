
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("post-container");
  let allPosts = await fetchPostsJson();
  const urlParams = new URLSearchParams(window.location.search);
  const authorParam = urlParams.get("author");

  // Filter posts by author if param exists
  if (authorParam) {
    allPosts = allPosts.filter(
      (post) => post.author.toLowerCase() === authorParam.toLowerCase()
    );

    const authorHeader = document.getElementById("author-name");
    if (authorHeader) {
      authorHeader.textContent = `Posts by ${authorParam}`;
    }
  }

  // Sorting functionality
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      const sortBy = e.target.value;
      if (sortBy === "newest") {
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (sortBy === "oldest") {
        allPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
      }
      visibleCount = 6;
      renderPosts(allPosts.slice(0, visibleCount), container);
    });
  }

  // Infinite scroll setup
  let visibleCount = 6;
  const incrementCount = 3;
  renderPosts(allPosts.slice(0, visibleCount), container);

  window.addEventListener("scroll", () => {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 100
    ) {
      visibleCount += incrementCount;
      renderPosts(allPosts.slice(0, visibleCount), container);
    }
  });
});

// Render posts with fixed date formatting
function renderPosts(posts, container) {
  container.innerHTML = "";
  posts.forEach((post) => {
    const postElem = document.createElement("div");
    postElem.classList.add("post");

    const postDate = new Date(post.date);
    const readableDate = postDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    postElem.innerHTML = `
      <h3><a href="post.html?id=${post.id}">${post.title}</a></h3>
      <p class="post-meta">By <a href="posts.html?author=${post.author}">${post.author}</a> | ${readableDate}</p>
      <p>${post.summary}</p>
    `;
    container.appendChild(postElem);
  });
}

async function fetchPostsJson() {
  try {
    const response = await fetch("posts.json");
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch posts.json:", error);
    return [];
  }
}
