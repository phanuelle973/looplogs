const authors = {
  Phanuelle: {
    pic: "assets/Phanuelle_Manuel.png",
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
  const el = document.createElement("article");

  el.innerHTML = `
    <h3><a href="${post.link}">${post.title}</a></h3>
    <p><strong>By:</strong> <a href="author.html?name=${encodeURIComponent(
      post.author
    )}">${post.author}</a> · <strong>Date:</strong> ${post.date}</p>
    <p><strong>Tags:</strong> ${post.tags.join(", ")}</p>
  `;

  // ❤️ Like button logic
  // ❤️ Like logic
  const likeKey = `${post.link}-likes`;
  const isLiked = localStorage.getItem(`${post.link}`) === "liked";
  let likeCount = parseInt(localStorage.getItem(likeKey)) || 0;

  const likeBtn = document.createElement("button");
  likeBtn.textContent = isLiked
    ? `❤️ Liked (${likeCount})`
    : `🤍 Like (${likeCount})`;
  likeBtn.className = "like-button";

  likeBtn.onclick = () => {
    const currentlyLiked = localStorage.getItem(`${post.link}`) === "liked";
    if (currentlyLiked) {
      localStorage.removeItem(`${post.link}`);
      likeCount = Math.max(0, likeCount - 1);
      localStorage.setItem(likeKey, likeCount);
      likeBtn.textContent = `🤍 Like (${likeCount})`;
    } else {
      localStorage.setItem(`${post.link}`, "liked");
      likeCount += 1;
      localStorage.setItem(likeKey, likeCount);
      likeBtn.textContent = `❤️ Liked (${likeCount})`;
    }
  };

  el.appendChild(likeBtn);
  postList.appendChild(el);
});

