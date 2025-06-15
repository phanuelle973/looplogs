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
    link: "posts/hackathon.md",
    tags: ["Projects", "Coding Journey"],
  },
];

const postList = document.getElementById("post-list");

posts.forEach(post => {
  const el = document.createElement("article");
  el.innerHTML = `
    <h3><a href="${post.link}">${post.title}</a></h3>
    <p><strong>By:</strong> ${post.author} · <strong>Date:</strong> ${post.date}</p>
    <p><strong>Tags:</strong> ${post.tags.join(", ")}</p>
  `;
  postList.appendChild(el);
});
