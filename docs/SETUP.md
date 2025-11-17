# Setup Guide

Complete guide to set up and customize Daily Work Tracker 3D.

## 📋 Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor (VS Code, Sublime Text, etc.) for customization
- Basic knowledge of HTML/CSS/JavaScript (for customization)

## 🚀 Quick Start

### Option 1: Use Live Version (Recommended)

Simply visit: **https://dataimp2-max.github.io/daily-work-tracker-3d/**

No installation required! Start tracking your work immediately.

### Option 2: Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/dataimp2-max/daily-work-tracker-3d.git
   cd daily-work-tracker-3d
   ```

2. **Open in browser**
   
   **Method A: Direct File**
   - Simply open `index.html` in your browser
   
   **Method B: Local Server (Recommended)**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server -p 8000
   ```
   
   Then visit: `http://localhost:8000`

## 🎨 Customization

### Change Colors

Edit `styles.css` and modify the CSS variables:

```css
:root {
    --primary-color: #6366f1;      /* Main brand color */
    --secondary-color: #8b5cf6;    /* Secondary brand color */
    --accent-color: #ec4899;       /* Accent color */
    --bg-color: #0f172a;           /* Background color */
    /* ... more variables */
}
```

### Add New Categories

Edit `script.js` and update these functions:

```javascript
function getCategoryColor(category) {
    const colors = {
        work: '#3b82f6',
        personal: '#8b5cf6',
        learning: '#10b981',
        meeting: '#f59e0b',
        other: '#6b7280',
        yourcategory: '#yourcolor'  // Add your category
    };
    return colors[category] || colors.other;
}

function getCategoryIcon(category) {
    const icons = {
        work: '💼',
        personal: '👤',
        learning: '📚',
        meeting: '🤝',
        other: '📌',
        yourcategory: '🎯'  // Add your icon
    };
    return icons[category] || icons.other;
}
```

Then update the HTML select in `index.html`:

```html
<select id="taskCategory">
    <option value="work">💼 Work</option>
    <option value="personal">👤 Personal</option>
    <option value="learning">📚 Learning</option>
    <option value="meeting">🤝 Meeting</option>
    <option value="yourcategory">🎯 Your Category</option>
    <option value="other">📌 Other</option>
</select>
```

### Modify 3D Background

Edit the `init3DBackground()` function in `script.js`:

```javascript
// Change particle count
const particlesCount = 1000;  // Increase or decrease

// Change particle color
const material = new THREE.PointsMaterial({
    color: 0x6366f1,  // Change this hex color
    size: 0.02,       // Change particle size
    transparent: true,
    opacity: 0.6      // Change opacity
});

// Change rotation speed
particles.rotation.x += 0.0005;  // Adjust speed
particles.rotation.y += 0.0005;  // Adjust speed
```

## 🔧 Configuration

### Local Storage Key

By default, data is stored under the key `dailyWorkTasks`. To change this:

```javascript
// In script.js
function saveTasksToStorage() {
    localStorage.setItem('yourCustomKey', JSON.stringify(tasks));
}

function loadTasksFromStorage() {
    const stored = localStorage.getItem('yourCustomKey');
    // ...
}
```

### Date Format

Modify the `formatDate()` function in `script.js`:

```javascript
return date.toLocaleDateString('en-US', { 
    month: 'short',    // 'short', 'long', 'numeric'
    day: 'numeric',    // 'numeric', '2-digit'
    year: 'numeric'    // 'numeric', '2-digit'
});
```

## 🌐 Deployment

### GitHub Pages

1. **Enable GitHub Pages**
   - Go to repository Settings
   - Navigate to Pages section
   - Select "GitHub Actions" as source
   - The workflow will automatically deploy

2. **Custom Domain (Optional)**
   - Add a `CNAME` file with your domain
   - Configure DNS settings with your provider

### Other Platforms

**Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

**Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Cloudflare Pages:**
- Connect your GitHub repository
- Set build command: (none)
- Set output directory: `/`

## 🐛 Troubleshooting

### Tasks not saving
- Check browser console for errors
- Ensure localStorage is enabled
- Try clearing browser cache

### 3D background not showing
- Ensure Three.js CDN is accessible
- Check browser console for errors
- Try a different browser

### Styles not loading
- Clear browser cache
- Check CSS file path
- Verify no syntax errors in CSS

### Share link not working
- Ensure URL encoding is correct
- Check browser console for errors
- Try generating a new link

## 📚 Additional Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

## 💬 Support

- Open an issue on GitHub
- Check existing issues for solutions
- Read the FAQ in README.md

---

Happy tracking! 🚀