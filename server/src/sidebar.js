const initSidebar = () => {
    const container = document.querySelector('.swagger-container');
    if (!container || document.getElementById('sakti-sidebar')) return;

    console.log('🛡️ Initializing SAKTI Sidebar...');

    // Create Sidebar
    const sidebar = document.createElement('div');
    sidebar.id = 'sakti-sidebar';
    sidebar.innerHTML = '<h4>API Categories</h4>';
    
    // Inject at the beginning of the container
    container.insertBefore(sidebar, container.firstChild);

    // Populate Sidebar from Tags
    const updateSidebar = () => {
      const tags = document.querySelectorAll('.opblock-tag');
      
      // Clear current list if needed
      const oldLinks = sidebar.querySelectorAll('.sidebar-link');
      oldLinks.forEach(l => l.remove());

      tags.forEach(tag => {
        const tagName = tag.getAttribute('data-tag');
        const link = document.createElement('div');
        link.className = 'sidebar-link';
        link.innerText = tagName;
        link.onclick = () => {
          tag.scrollIntoView({ behavior: 'smooth', block: 'start' });
          document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        };
        sidebar.appendChild(link);
      });
    };

    // Re-populate when Swagger UI finishes rendering or changes
    setTimeout(updateSidebar, 1500);
  };

  // Watch for Swagger UI initialization
  const observer = new MutationObserver((mutations) => {
    if (document.querySelector('.swagger-container')) {
      initSidebar();
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
