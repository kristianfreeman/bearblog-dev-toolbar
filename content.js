// Configuration
const defaultDomains = ['bearblog.dev'];
const navItems = [
  { name: 'Nav', icon: '🚥', url: '/dashboard/nav' },
  { name: 'Posts', icon: '📝', url: '/dashboard/posts' },
  { name: 'Pages', icon: '📄', url: '/dashboard/pages' },
  { name: 'Theme', icon: '🎨', url: '/dashboard/styles' },
  { name: 'Analytics', icon: '📈', url: '/dashboard/analytics' },
  { name: 'Directives', icon: '🏗️', url: '/dashboard/directives' },
];

// Function to get allowed domains and blogs
function getAllowedDomainsAndBlogs(callback) {
  const storageAPI = typeof browser !== 'undefined' ? browser.storage.local : chrome.storage.local;
  storageAPI.get(['customDomains', 'blogs'], (result) => {
    const customDomains = result.customDomains || [];
    const blogs = result.blogs || [];
    callback([...defaultDomains, ...customDomains, ...blogs.map(blog => blog.customDomain).filter(Boolean)], blogs);
  });
}

// Function to determine current blog
function getCurrentBlog(blogs) {
  const currentHost = window.location.hostname;
  const currentPath = window.location.pathname;

  // Check if we're on bearblog.dev with a blog slug
  if (currentHost === 'bearblog.dev') {
    const blogSlug = currentPath.split('/')[1];
    return blogs.find(blog => blog.slug === blogSlug) || null;
  }

  // Check if we're on a custom domain
  return blogs.find(blog => blog.customDomain === currentHost) || null;
}

// Function to create and insert navbar
function createNavbar(allowedDomains, blogs) {
  const currentBlog = getCurrentBlog(blogs);
  
  if (allowedDomains.includes(window.location.hostname) || currentBlog) {
    const navbar = document.createElement('div');
    navbar.id = 'bear-devpanel-nav';
    navbar.style.cssText = `
      position: fixed;
      font-size: 1rem;
      top: 0;
      left: 0;
      right: 0;
      background-color: black;
      color: white;
      font-family: monospace;
      padding: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 9999;
    `;

    const leftContainer = document.createElement('div');
    const rightContainer = document.createElement('div');

    const bear = document.createElement('a');
    bear.href = 'https://bearblog.dev';
    bear.innerHTML = '🐻 🚧';
    leftContainer.appendChild(bear);

    leftContainer.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 20px;
      flex: 1;
    `;

    if (currentBlog) {
      const blogSelector = document.createElement('select');
      blogSelector.style.cssText = `
        background-color: black;
        font-family: monospace;
        color: white;
        border: 1px solid white;
        padding: 5px;
      `;
      blogs.forEach(blog => {
        const option = document.createElement('option');
        option.value = blog.slug;
        option.textContent = blog.name;
        option.selected = blog.slug === currentBlog.slug;
        blogSelector.appendChild(option);
      });
      blogSelector.addEventListener('change', (e) => {
        const selectedBlog = blogs.find(blog => blog.slug === e.target.value);
        if (selectedBlog) {
          window.location.href = `https://bearblog.dev/${selectedBlog.slug}/dashboard`;
        }
      });
      leftContainer.appendChild(blogSelector);
    }

    rightContainer.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 20px;
      flex: 1;
    `;

    navItems.forEach(item => {
      const link = document.createElement('a');
      link.href = currentBlog ? `https://bearblog.dev/${currentBlog.slug}${item.url}` : item.url;
      link.innerHTML = `${item.icon} ${item.name}`;
      link.style.cssText = `
        text-decoration: none;
        color: inherit;
      `;
      rightContainer.appendChild(link);
    });

    navbar.appendChild(leftContainer);
    navbar.appendChild(rightContainer);

    document.body.insertBefore(navbar, document.body.firstChild);
    document.body.style.paddingTop = `${navbar.offsetHeight}px`;
  }
}

// Initialize the extension
getAllowedDomainsAndBlogs((allowedDomains, blogs) => {
  createNavbar(allowedDomains, blogs);
});
