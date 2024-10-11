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

// Logging function
function log(message) {
  // If you want logging, uncomment the following line
  // console.log(`[Bear DevPanel]: ${message}`);
}

// Function to get allowed domains and blogs
function getAllowedDomainsAndBlogs(callback) {
  log('Attempting to retrieve blogs from storage');
  chrome.storage.local.get(['blogs'], (result) => {
    if (chrome.runtime.lastError) {
      log(`Error retrieving from storage: ${chrome.runtime.lastError.message}`);
      callback(defaultDomains, []);
      return;
    }

    const blogs = result.blogs || [];
    log(`Retrieved blogs: ${JSON.stringify(blogs)}`);
    const customDomains = blogs.map(blog => blog.customDomain).filter(Boolean);
    log(`Extracted custom domains: ${JSON.stringify(customDomains)}`);
    const allowedDomains = [...defaultDomains, ...customDomains];
    log(`Final allowed domains: ${JSON.stringify(allowedDomains)}`);
    callback(allowedDomains, blogs);
  });
}

// Function to determine current blog
function getCurrentBlog(blogs) {
  const currentHost = window.location.hostname;
  const currentPath = window.location.pathname;
  log(`Current location: ${currentHost}${currentPath}`);

  if (currentHost === 'bearblog.dev') {
    const blogSlug = currentPath.split('/')[1];
    const currentBlog = blogs.find(blog => blog.slug === blogSlug) || null;
    log(`On bearblog.dev, current blog: ${JSON.stringify(currentBlog)}`);
    return currentBlog;
  }

  const currentBlog = blogs.find(blog => blog.customDomain === currentHost) || null;
  log(`On custom domain, current blog: ${JSON.stringify(currentBlog)}`);
  return currentBlog;
}

// Function to create and insert navbar
function createNavbar(allowedDomains, blogs) {
  log('Creating navbar');
  const currentBlog = getCurrentBlog(blogs);

  if (allowedDomains.includes(window.location.hostname) || currentBlog) {
    log('Current domain is allowed or current blog exists, creating navbar');
    const navbar = document.createElement('div');
    navbar.id = 'bear-devpanel';

    const leftContainer = document.createElement('div');
    leftContainer.id = 'bear-devpanel-left';
    const rightContainer = document.createElement('div');
    rightContainer.id = 'bear-devpanel-right';

    const bear = document.createElement('a');
    bear.href = 'https://bearblog.dev';
    bear.innerHTML = '🐻 🚧';
    leftContainer.appendChild(bear);

    if (currentBlog) {
      log('Current blog exists, creating blog selector');
      const blogSelector = document.createElement('select');
      blogSelector.id = 'bear-devpanel-blog-selector';

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
    } else {
      log('No current blog, skipping blog selector');
    }

    navItems.forEach(item => {
      const link = document.createElement('a');
      const blog = currentBlog ? currentBlog : blogs[0];
      link.href = blog ? `https://bearblog.dev/${blog.slug}${item.url}` : item.url;
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
    log('Navbar inserted into the page');
  } else {
    log('Current domain is not allowed and no current blog exists, skipping navbar creation');
  }
}

// Initialize the extension
log('Initializing Bear DevPanel');
getAllowedDomainsAndBlogs((allowedDomains, blogs) => {
  log('Retrieved allowed domains and blogs, creating navbar');
  createNavbar(allowedDomains, blogs);
});

