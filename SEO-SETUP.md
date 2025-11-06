# SEO Setup Guide for Diet Tracker

This document explains all the SEO optimizations implemented in the Diet Tracker application.

## 📋 Meta Tags Implemented

### 1. **Primary Meta Tags**
- ✅ `<title>` - Optimized with main keywords
- ✅ `description` - Compelling 155-character description
- ✅ `keywords` - Relevant search terms
- ✅ `author` - Content author
- ✅ `robots` - Search engine crawling instructions
- ✅ `language` - Content language
- ✅ `revisit-after` - Crawl frequency hint

### 2. **Open Graph (Facebook/LinkedIn)**
Complete Open Graph implementation for rich social media previews:
- ✅ `og:type` - Website type
- ✅ `og:url` - Canonical URL
- ✅ `og:title` - Social media title
- ✅ `og:description` - Social media description
- ✅ `og:image` - Preview image (1200x630px recommended)
- ✅ `og:site_name` - Site name
- ✅ `og:locale` - Language/region

### 3. **Twitter Card Meta Tags**
Optimized Twitter sharing:
- ✅ `twitter:card` - Card type (summary_large_image)
- ✅ `twitter:title` - Tweet title
- ✅ `twitter:description` - Tweet description
- ✅ `twitter:image` - Preview image
- ✅ `twitter:creator` - Twitter handle

### 4. **Technical SEO**
- ✅ Canonical URL to prevent duplicate content
- ✅ Language declaration (`lang="en"`)
- ✅ Character encoding (UTF-8)
- ✅ Viewport meta tag for mobile
- ✅ IE compatibility mode
- ✅ Theme color for mobile browsers

### 5. **Structured Data (Schema.org)**
JSON-LD structured data for rich snippets:
- ✅ WebApplication schema
- ✅ Application details (name, description, category)
- ✅ Pricing information
- ✅ Feature list
- ✅ Aggregate rating (for future use)

## 📄 Additional SEO Files

### 1. **robots.txt** (`/public/robots.txt`)
Controls search engine crawling:
```
User-agent: *
Allow: /
Sitemap: https://yourdomain.com/sitemap.xml
```

### 2. **sitemap.xml** (`/public/sitemap.xml`)
XML sitemap for search engines:
- Lists all important pages
- Includes change frequency and priority
- Update when adding new pages

### 3. **manifest.json** (`/public/manifest.json`)
PWA manifest for mobile optimization:
- App name and description
- Icons for different sizes
- Theme colors
- Display mode
- Categories

## 🎯 Keywords Targeting

### Primary Keywords
- diet tracker
- calorie counter
- protein tracker
- nutrition app

### Secondary Keywords
- food diary
- calorie tracking
- Indian food nutrition
- meal tracker
- diet planner
- health tracker
- fitness app
- macro tracker

## 🖼️ Images Needed for Complete SEO

To fully optimize social sharing, create these images:

### 1. **Open Graph Image** (Required)
- **Location**: `/public/og-image.jpg`
- **Size**: 1200 x 630 pixels
- **Format**: JPG or PNG
- **Content**: App screenshot or branded image with text overlay
- **Text**: "Diet Tracker - Track Your Nutrition Goals"

### 2. **Twitter Image** (Optional, can use OG image)
- **Location**: `/public/twitter-image.jpg`
- **Size**: 1200 x 675 pixels
- **Format**: JPG or PNG

### 3. **App Icons** (For PWA)
- **192x192**: `/public/icon-192x192.png`
- **512x512**: `/public/icon-512x512.png`
- **Apple Touch Icon**: `/public/apple-touch-icon.png` (180x180)

### 4. **Favicons**
- **32x32**: `/public/favicon-32x32.png`
- **16x16**: `/public/favicon-16x16.png`

### 5. **Screenshot** (For Schema.org)
- **Location**: `/public/screenshot.jpg`
- **Size**: 1280 x 720 pixels
- **Content**: Main app interface

## 🔧 Customization Required

Before deploying, update these placeholders:

### 1. **Domain URLs**
Replace `https://yourdomain.com/` with your actual domain in:
- `index.html` - All OG and Twitter meta tags
- `sitemap.xml` - Base URL
- `robots.txt` - Sitemap URL

### 2. **Twitter Handle**
Replace `@yourusername` with your actual Twitter handle:
- Line 40 in `index.html`

### 3. **Image Paths**
Update image paths once you create them:
- `/og-image.jpg`
- `/twitter-image.jpg`
- `/screenshot.jpg`

### 4. **Dates**
Update `lastmod` in `sitemap.xml` whenever content changes

## 📊 Testing Your SEO

### 1. **Social Media Preview Tools**
Test how your site appears when shared:
- **Facebook**: [Sharing Debugger](https://developers.facebook.com/tools/debug/)
- **Twitter**: [Card Validator](https://cards-dev.twitter.com/validator)
- **LinkedIn**: [Post Inspector](https://www.linkedin.com/post-inspector/)

### 2. **Google Tools**
- **Rich Results Test**: [Test Structured Data](https://search.google.com/test/rich-results)
- **Mobile-Friendly Test**: [Mobile Test](https://search.google.com/test/mobile-friendly)
- **PageSpeed Insights**: [Speed Test](https://pagespeed.web.dev/)

### 3. **SEO Analysis Tools**
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) (Built into Chrome DevTools)
- [SEO Site Checkup](https://seositecheckup.com/)
- [Screaming Frog](https://www.screamingfrogseojspider.co.uk/) (Desktop app)

## 🚀 SEO Best Practices Implemented

### ✅ On-Page SEO
- Semantic HTML structure
- Descriptive title tag with keywords
- Unique meta description
- Proper heading hierarchy (H1, H2, H3)
- Alt text for images (add when images are created)
- Fast loading times (Vite optimization)

### ✅ Technical SEO
- Mobile-responsive design
- Fast page load speed
- HTTPS ready
- Clean URL structure
- Structured data markup
- XML sitemap
- Robots.txt file

### ✅ Content SEO
- Keyword-optimized content
- Clear value proposition
- Feature descriptions
- User benefits highlighted

## 📈 Next Steps for Better SEO

### 1. **Content Strategy**
- Write blog posts about nutrition and diet tracking
- Create how-to guides
- Add FAQ section
- User testimonials

### 2. **Link Building**
- Submit to web directories
- Share on social media
- Get featured in health/fitness blogs
- Create shareable content

### 3. **Local SEO** (if applicable)
- Add location-specific content
- Create Google My Business listing
- Get local citations

### 4. **Performance Optimization**
- Optimize images (WebP format)
- Enable compression
- Minimize CSS/JS
- Use CDN

### 5. **Analytics Setup**
Add tracking to measure SEO success:
```html
<!-- Google Analytics -->
<!-- Add before </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 🔍 Monitoring SEO Performance

### Key Metrics to Track
1. **Organic Traffic**: Users from search engines
2. **Keyword Rankings**: Position in search results
3. **Click-Through Rate (CTR)**: % of users who click
4. **Bounce Rate**: % of users who leave quickly
5. **Page Load Time**: Speed of page loading
6. **Mobile Usability**: Mobile experience quality

### Tools to Use
- **Google Analytics**: Traffic analysis
- **Google Search Console**: Search performance
- **Bing Webmaster Tools**: Bing search data
- **Ahrefs/SEMrush**: Keyword tracking (paid)

## 📱 Mobile Optimization

Already implemented:
- ✅ Responsive design
- ✅ Viewport meta tag
- ✅ Touch-friendly interface
- ✅ Fast loading
- ✅ PWA-ready manifest

## 🎨 Branding Elements

For maximum SEO impact:
1. **Consistent Branding**: Logo, colors, typography
2. **Unique Value Proposition**: What makes your app special
3. **Clear Call-to-Action**: "Start Tracking" button
4. **Trust Signals**: Privacy policy, terms of service

## 📝 Content Updates

Keep SEO fresh:
- Update sitemap.xml when adding pages
- Refresh meta descriptions quarterly
- Add new keywords based on analytics
- Update schema.org data with new features
- Monitor and respond to user feedback

---

**Note**: After deploying, submit your sitemap to:
- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)

**Last Updated**: 2025-11-06
