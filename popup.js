// Add this at the beginning of your script
let logMessages = [];

function log(message) {
  console.log(message);
  logMessages.push(`${new Date().toISOString()}: ${message}`);
  updateLogDisplay();
}

function updateLogDisplay() {
  const logDiv = document.getElementById('logMessages');
  if (logDiv) {
    logDiv.innerHTML = logMessages.join('<br>');
    logDiv.scrollTop = logDiv.scrollHeight;
  }
}

const storage = chrome.storage.local;

function getItem(key) {
  return new Promise((resolve, reject) => {
    storage.get(key, (result) => {
      const error = chrome.runtime.lastError;
      if (error) {
        log(`Error in getItem: ${error.message}`);
        reject(error);
      } else {
        log(`Retrieved item: ${key}`);
        resolve(result[key]);
      }
    });
  });
}

function setItem(key, value) {
  return new Promise((resolve, reject) => {
    storage.set({ [key]: value }, () => {
      const error = chrome.runtime.lastError;
      if (error) {
        log(`Error in setItem: ${error.message}`);
        reject(error);
      } else {
        log(`Set item: ${key}`);
        resolve();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  log('DOM Content Loaded');
  const addButton = document.getElementById('addBlog');
  const removeButton = document.getElementById('removeBlog');
  const blogNameInput = document.getElementById('blogNameInput');
  const blogSlugInput = document.getElementById('blogSlugInput');
  const customDomainInput = document.getElementById('customDomainInput');
  const messageDiv = document.getElementById('message');
  const blogList = document.getElementById('blogList');

  async function updateBlogList() {
    log('Updating blog list');
    try {
      const blogs = await getItem('blogs') || [];
      log(`Retrieved blogs: ${JSON.stringify(blogs)}`);
      blogList.innerHTML = '';
      blogs.forEach(function(blog) {
        const option = document.createElement('option');
        option.value = blog.slug;
        option.textContent = `${blog.name} (${blog.slug})${blog.customDomain ? ` - ${blog.customDomain}` : ''}`;
        blogList.appendChild(option);
      });
      log('Blog list updated');
    } catch (error) {
      log(`Error updating blog list: ${error.message}`);
      messageDiv.textContent = 'Error updating blog list: ' + error.message;
    }
  }

  updateBlogList();

  addButton.addEventListener('click', async function() {
    log('Add button clicked');
    const newBlog = {
      name: blogNameInput.value.trim(),
      slug: blogSlugInput.value.trim(),
      customDomain: customDomainInput.value.trim() || null
    };

    if (newBlog.name && newBlog.slug) {
      try {
        const blogs = await getItem('blogs') || [];
        if (!blogs.some(blog => blog.slug === newBlog.slug)) {
          blogs.push(newBlog);
          await setItem('blogs', blogs);
          messageDiv.textContent = 'Blog added successfully!';
          blogNameInput.value = '';
          blogSlugInput.value = '';
          customDomainInput.value = '';
          updateBlogList();
        } else {
          messageDiv.textContent = 'Blog with this slug already exists!';
        }
      } catch (error) {
        log(`Error adding blog: ${error.message}`);
        messageDiv.textContent = 'Error adding blog: ' + error.message;
      }
    } else {
      messageDiv.textContent = 'Please enter a valid blog name and slug!';
    }
  });

  removeButton.addEventListener('click', async function() {
    log('Remove button clicked');
    const selectedSlug = blogList.value;
    if (selectedSlug) {
      try {
        let blogs = await getItem('blogs') || [];
        blogs = blogs.filter(blog => blog.slug !== selectedSlug);
        await setItem('blogs', blogs);
        messageDiv.textContent = 'Blog removed successfully!';
        updateBlogList();
      } catch (error) {
        log(`Error removing blog: ${error.message}`);
        messageDiv.textContent = 'Error removing blog: ' + error.message;
      }
    } else {
      messageDiv.textContent = 'Please select a blog to remove!';
    }
  });
});

