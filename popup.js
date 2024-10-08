document.addEventListener('DOMContentLoaded', function() {
  const addButton = document.getElementById('addBlog');
  const removeButton = document.getElementById('removeBlog');
  const blogNameInput = document.getElementById('blogNameInput');
  const blogSlugInput = document.getElementById('blogSlugInput');
  const customDomainInput = document.getElementById('customDomainInput');
  const messageDiv = document.getElementById('message');
  const blogList = document.getElementById('blogList');

  function updateBlogList() {
    chrome.storage.local.get('blogs', function(result) {
      const blogs = result.blogs || [];
      blogList.innerHTML = '';
      blogs.forEach(function(blog) {
        const option = document.createElement('option');
        option.value = blog.slug;
        option.textContent = `${blog.name} (${blog.slug})${blog.customDomain ? ` - ${blog.customDomain}` : ''}`;
        blogList.appendChild(option);
      });
    });
  }

  updateBlogList();

  addButton.addEventListener('click', function() {
    const newBlog = {
      name: blogNameInput.value.trim(),
      slug: blogSlugInput.value.trim(),
      customDomain: customDomainInput.value.trim() || null
    };

    if (newBlog.name && newBlog.slug) {
      chrome.storage.local.get('blogs', function(result) {
        const blogs = result.blogs || [];
        if (!blogs.some(blog => blog.slug === newBlog.slug)) {
          blogs.push(newBlog);
          chrome.storage.local.set({blogs: blogs}, function() {
            messageDiv.textContent = 'Blog added successfully!';
            blogNameInput.value = '';
            blogSlugInput.value = '';
            customDomainInput.value = '';
            updateBlogList();
          });
        } else {
          messageDiv.textContent = 'Blog with this slug already exists!';
        }
      });
    } else {
      messageDiv.textContent = 'Please enter a valid blog name and slug!';
    }
  });

  removeButton.addEventListener('click', function() {
    const selectedSlug = blogList.value;
    if (selectedSlug) {
      chrome.storage.local.get('blogs', function(result) {
        let blogs = result.blogs || [];
        blogs = blogs.filter(blog => blog.slug !== selectedSlug);
        chrome.storage.local.set({blogs: blogs}, function() {
          messageDiv.textContent = 'Blog removed successfully!';
          updateBlogList();
        });
      });
    } else {
      messageDiv.textContent = 'Please select a blog to remove!';
    }
  });
});
