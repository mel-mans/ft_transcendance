# AI FEATURES API DOCUMENTATION - FRONTEND GUIDE

**For:** Frontend Developer  
**Project:** ft_transcendence (42 Coloc)  
**Features:** AI Recommendations & Bio Generation  
**Last Updated:** March 9, 2026  

---

## TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Authentication](#authentication)
3. [AI Recommendation System](#ai-recommendation-system)
4. [Bio Generation](#bio-generation)
5. [Integration Examples](#integration-examples)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

---

## QUICK START

**Base URL:** `https://localhost/api`

**Two AI Features Available:**

1. **🎯 Smart Recommendations** - Get best roommate matches with AI scores
2. **✍️ Bio Generation** - AI writes profile bios for users

**Both features are fully integrated in the backend and ready to use!**

---

## AUTHENTICATION

**All AI features use cookie-based authentication (already implemented in your app).**

```javascript
// All fetch calls should include credentials
fetch('https://localhost/api/...', {
  credentials: 'include',  // ✅ This sends the JWT cookie
  headers: {
    'Content-Type': 'application/json'
  }
})
```

**No need to manually handle tokens!** The JWT cookie is sent automatically.

---

## AI RECOMMENDATION SYSTEM

### Overview

The AI recommendation system analyzes user preferences and finds the best roommate matches. It returns:
- **Best match** with compatibility score (0-100%)
- **Algorithm used** (content-based, online learning, or collaborative filtering)
- **All listings** sorted by compatibility

---

### Endpoint: Get Recommendations

**GET** `/api/listings/recommendations`

**Authentication:** Required (JWT cookie)

**Request:**
```javascript
const response = await fetch('/api/listings/recommendations', {
  credentials: 'include'
});

const data = await response.json();
```

**Response (Success - 200 OK):**
```json
{
  "recommendation": {
    "id": 1,
    "userId": 2,
    "title": "Clean Apartment in Casablanca Marina",
    "location": "Casablanca Marina",
    "price": 5500,
    "currency": "MAD",
    "availableDate": "2026-04-01T00:00:00.000Z",
    "spotsTotal": 2,
    "spotsFilled": 0,
    "description": "Very clean and quiet apartment. Perfect for studious people.",
    "images": [],
    "hasWifi": true,
    "hasKitchen": true,
    "hasLaundry": true,
    "hasMetroNearby": true,
    "hasGarden": false,
    "hasParking": true,
    "petsOK": false,
    "hasGym": false,
    "hasAC": true,
    "isSecure": true,
    "isActive": true,
    "createdAt": "2026-03-08T14:00:06.574Z",
    "updatedAt": "2026-03-08T14:00:06.574Z",
    "user": {
      "id": 2,
      "username": "alice_clean",
      "name": "Alice Clean",
      "avatar": "default-avatar.png",
      "bio": "Clean and organized person"
    }
  },
  "aiScore": 0.866,
  "algorithm": "content_fallback",
  "exploration": false,
  "allListings": [
    {
      "id": 1,
      "title": "Clean Apartment...",
      "price": 5500,
      "user": {...}
    },
    {
      "id": 2,
      "title": "Pet-Friendly House...",
      "price": 4500,
      "user": {...}
    }
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `recommendation` | Object | The best match listing (full listing object) |
| `aiScore` | Number (0-1) | Match compatibility (0.866 = 86.6% match) |
| `algorithm` | String | Algorithm used: `"content_fallback"`, `"online_ml"`, or `"collaborative"` |
| `exploration` | Boolean | `true` if showing exploratory match, `false` if best match |
| `allListings` | Array | All available listings (for displaying full list) |

**Error Responses:**

```json
// 404 - User has no preferences
{
  "statusCode": 404,
  "message": "User preferences not found. Please complete your profile first.",
  "error": "Not Found"
}

// 404 - No listings available
{
  "recommendations": [],
  "message": "No listings available yet"
}

// 401 - Not authenticated
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

### Understanding AI Scores

**Score Range:** 0.0 to 1.0 (convert to percentage by multiplying by 100)

**Score Interpretation:**

| Score | Percentage | Quality | Display |
|-------|-----------|---------|---------|
| 0.80 - 1.00 | 80-100% | Excellent match | 🟢 Green badge |
| 0.60 - 0.79 | 60-79% | Good match | 🟡 Yellow badge |
| 0.40 - 0.59 | 40-59% | Moderate match | 🟠 Orange badge |
| 0.00 - 0.39 | 0-39% | Poor match | ⚪ Gray badge |

**Example:**
```javascript
const percentage = Math.round(data.aiScore * 100);  // 0.866 → 87%

function getMatchQuality(score) {
  if (score >= 0.8) return { color: 'green', label: 'Excellent' };
  if (score >= 0.6) return { color: 'yellow', label: 'Good' };
  if (score >= 0.4) return { color: 'orange', label: 'Moderate' };
  return { color: 'gray', label: 'Poor' };
}
```

---

### Algorithm Types Explained

**For displaying to users (optional):**

| Algorithm | What It Means | When It's Used |
|-----------|---------------|----------------|
| `content_fallback` | Based on profile similarity | Always available (default) |
| `online_ml` | Learned from your behavior | After you interact with 10+ listings |
| `collaborative` | "People like you also liked..." | After 20+ users interact with listings |

**Display Example:**
```javascript
const algorithmLabels = {
  'content_fallback': 'Profile Match',
  'online_ml': 'Personalized for You',
  'collaborative': 'Community Recommended'
};

const label = algorithmLabels[data.algorithm];
// Shows: "Profile Match" or "Personalized for You"
```

---

## BIO GENERATION

### Overview

Generate personalized profile bios using AI. Users provide their hobbies and personality, and the AI creates a natural, friendly bio.

---

### Endpoint: Generate Bio

**POST** `/api/ai/generate-bio`

**Authentication:** Required (JWT cookie)

**Request Body:**
```javascript
const response = await fetch('/api/ai/generate-bio', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': currentUser.id.toString()  // Required header
  },
  body: JSON.stringify({
    hobbies: 'gaming, cooking, reading',
    personality: 'quiet, clean, organized',
    lifestyle: 'night owl, prefer peaceful environment',  // Optional
    looking_for: 'someone who respects quiet hours'       // Optional
  })
});

const data = await response.json();
```

**Request Fields:**

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `hobbies` | String | ✅ Yes | 200 chars | User's hobbies/interests |
| `personality` | String | ✅ Yes | 200 chars | Personality traits |
| `lifestyle` | String | ❌ Optional | 200 chars | Lifestyle preferences |
| `looking_for` | String | ❌ Optional | 200 chars | What they seek in roommate |

**Response (Success - 200 OK):**
```json
{
  "bio": "I'm a quiet and organized person who enjoys gaming, cooking, and reading. As a night owl, I prefer a peaceful environment and am looking for someone who respects quiet hours.",
  "length": 170,
  "generated_at": "2026-03-09T01:15:00Z"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `bio` | String | Generated bio text (100-300 characters) |
| `length` | Number | Character count of bio |
| `generated_at` | String | ISO timestamp of generation |

**Error Responses:**

```json
// 401 - Missing User ID header
{
  "detail": "Unauthorized: Missing X-User-Id header"
}

// 422 - Validation error
{
  "detail": [
    {
      "loc": ["body", "hobbies"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}

// 429 - Rate limit (too fast)
{
  "detail": "Rate limit exceeded. Please wait 5 seconds."
}

// 500 - Generation failed (fallback bio returned)
{
  "bio": "I enjoy gaming, cooking, reading and would describe myself as quiet, clean, organized. Looking for a great roommate!",
  "length": 120,
  "generated_at": "2026-03-09T01:15:00Z"
}
```

---

### Rate Limiting

**Limit:** 1 request per 5 seconds per user

**How to handle:**
```javascript
async function generateBio(data) {
  try {
    const response = await fetch('/api/ai/generate-bio', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': currentUser.id.toString()
      },
      body: JSON.stringify(data)
    });

    if (response.status === 429) {
      alert('Please wait a few seconds before generating again');
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Bio generation failed:', error);
    return null;
  }
}
```

---

## INTEGRATION EXAMPLES

### Example 1: Display Recommended Listing

```jsx
import { useState, useEffect } from 'react';

function RecommendedListing() {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendation();
  }, []);

  async function loadRecommendation() {
    try {
      const response = await fetch('/api/listings/recommendations', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendation(data);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading your perfect match...</div>;
  
  if (!recommendation?.recommendation) {
    return <div>No recommendations available yet. Complete your profile!</div>;
  }

  const { recommendation: listing, aiScore } = recommendation;
  const matchPercentage = Math.round(aiScore * 100);

  return (
    <div className="recommended-listing">
      <div className="badge">⭐ {matchPercentage}% Match</div>
      <h2>{listing.title}</h2>
      <p>{listing.location}</p>
      <p>{listing.price} {listing.currency}/month</p>
      <p>{listing.description}</p>
      <button onClick={() => viewListing(listing.id)}>
        View Details
      </button>
    </div>
  );
}
```

---

### Example 2: Bio Generation Form

```jsx
function BioGenerator({ onBioGenerated }) {
  const [formData, setFormData] = useState({
    hobbies: '',
    personality: '',
    lifestyle: '',
    looking_for: ''
  });
  const [generating, setGenerating] = useState(false);
  const [generatedBio, setGeneratedBio] = useState('');

  async function handleGenerate() {
    if (!formData.hobbies || !formData.personality) {
      alert('Please fill in hobbies and personality');
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch('/api/ai/generate-bio', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString()
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedBio(data.bio);
        onBioGenerated(data.bio);  // Pass to parent component
      } else if (response.status === 429) {
        alert('Please wait a few seconds before trying again');
      }
    } catch (error) {
      console.error('Bio generation failed:', error);
      alert('Failed to generate bio. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="bio-generator">
      <h3>Generate Your Bio with AI</h3>
      
      <label>
        Hobbies (required):
        <input
          type="text"
          placeholder="e.g., gaming, cooking, reading"
          maxLength={200}
          value={formData.hobbies}
          onChange={(e) => setFormData({...formData, hobbies: e.target.value})}
        />
      </label>

      <label>
        Personality (required):
        <input
          type="text"
          placeholder="e.g., quiet, clean, friendly"
          maxLength={200}
          value={formData.personality}
          onChange={(e) => setFormData({...formData, personality: e.target.value})}
        />
      </label>

      <label>
        Lifestyle (optional):
        <input
          type="text"
          placeholder="e.g., night owl, prefer quiet"
          maxLength={200}
          value={formData.lifestyle}
          onChange={(e) => setFormData({...formData, lifestyle: e.target.value})}
        />
      </label>

      <label>
        Looking for (optional):
        <input
          type="text"
          placeholder="e.g., someone who respects quiet hours"
          maxLength={200}
          value={formData.looking_for}
          onChange={(e) => setFormData({...formData, looking_for: e.target.value})}
        />
      </label>

      <button onClick={handleGenerate} disabled={generating}>
        {generating ? '✨ Generating...' : '✨ Generate Bio'}
      </button>

      {generatedBio && (
        <div className="generated-bio">
          <h4>Generated Bio:</h4>
          <p>{generatedBio}</p>
          <small>{generatedBio.length} characters</small>
        </div>
      )}
    </div>
  );
}
```

---

### Example 3: Complete Profile Flow with Auto-Bio

```jsx
function CompleteProfilePage() {
  const [profileData, setProfileData] = useState({
    username: '',
    name: '',
    age: '',
    bio: '',
    // ... preferences
  });
  const [bioGenerating, setBioGenerating] = useState(false);

  // Auto-generate bio from preferences
  async function autoGenerateBio() {
    // Build hobbies from preferences
    const hobbies = [
      profileData.cooks ? 'cooking' : '',
      profileData.gamer ? 'gaming' : '',
      profileData.social ? 'socializing' : ''
    ].filter(Boolean).join(', ') || 'various activities';

    // Build personality from preferences
    const personality = [
      profileData.clean ? 'clean' : '',
      profileData.studious ? 'studious' : '',
      profileData.social ? 'friendly' : 'quiet'
    ].filter(Boolean).join(', ');

    // Build lifestyle
    const lifestyle = [
      profileData.nightOwl ? 'night owl' : profileData.earlyBird ? 'early bird' : '',
      profileData.quietHours ? 'values quiet time' : ''
    ].filter(Boolean).join(', ');

    setBioGenerating(true);

    try {
      const response = await fetch('/api/ai/generate-bio', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString()
        },
        body: JSON.stringify({
          hobbies,
          personality,
          lifestyle,
          looking_for: 'a compatible roommate'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData({...profileData, bio: data.bio});
      }
    } catch (error) {
      console.error('Auto-bio failed:', error);
    } finally {
      setBioGenerating(false);
    }
  }

  async function handleSubmit() {
    // If bio is empty, auto-generate it
    if (!profileData.bio) {
      await autoGenerateBio();
    }

    // Submit complete profile
    const response = await fetch('/api/users/complete-profile', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });

    if (response.ok) {
      navigate('/dashboard');
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      {/* Username, name, age fields... */}
      
      <label>
        Bio:
        <textarea
          value={profileData.bio}
          onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
          placeholder="Tell us about yourself..."
        />
        <button type="button" onClick={autoGenerateBio} disabled={bioGenerating}>
          {bioGenerating ? 'Generating...' : '✨ Generate with AI'}
        </button>
      </label>

      {/* Preferences checkboxes... */}

      <button type="submit">Complete Profile</button>
    </form>
  );
}
```

---

### Example 4: Listings Page with Match Badges

```jsx
function ListingsPage() {
  const [listings, setListings] = useState([]);
  const [topMatch, setTopMatch] = useState(null);
  const [aiScore, setAiScore] = useState(null);

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    const response = await fetch('/api/listings/recommendations', {
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      setTopMatch(data.recommendation);
      setAiScore(data.aiScore);
      setListings(data.allListings);
    }
  }

  function getMatchBadge(isTopMatch) {
    if (!isTopMatch || !aiScore) return null;

    const percentage = Math.round(aiScore * 100);
    const color = aiScore >= 0.8 ? 'green' : aiScore >= 0.6 ? 'yellow' : 'orange';

    return (
      <span className={`badge ${color}`}>
        ✨ {percentage}% Match
      </span>
    );
  }

  return (
    <div className="listings-page">
      {/* Featured Top Match */}
      {topMatch && (
        <div className="featured-match">
          <h2>⭐ Perfect Match for You</h2>
          {getMatchBadge(true)}
          <ListingCard listing={topMatch} featured />
        </div>
      )}

      {/* All Other Listings */}
      <div className="all-listings">
        <h2>More Options</h2>
        <div className="grid">
          {listings.map(listing => (
            <ListingCard 
              key={listing.id} 
              listing={listing}
              isTopMatch={listing.id === topMatch?.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## ERROR HANDLING

### Common Errors and Solutions

**1. User Not Authenticated (401)**

```javascript
if (response.status === 401) {
  // Redirect to login
  navigate('/login');
}
```

---

**2. User Has No Preferences (404)**

```javascript
if (response.status === 404) {
  const data = await response.json();
  if (data.message.includes('preferences not found')) {
    // Redirect to profile completion
    navigate('/complete-profile');
  }
}
```

---

**3. Rate Limit Exceeded (429)**

```javascript
if (response.status === 429) {
  // Show message and disable button for 5 seconds
  setError('Please wait a few seconds before trying again');
  setTimeout(() => setError(null), 5000);
}
```

---

**4. Validation Error (422)**

```javascript
if (response.status === 422) {
  const data = await response.json();
  // Show which fields are invalid
  const errors = data.detail.map(err => `${err.loc[1]}: ${err.msg}`);
  setErrors(errors);
}
```

---

### Complete Error Handler

```javascript
async function handleApiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include'
    });

    // Success
    if (response.ok) {
      return await response.json();
    }

    // Handle errors
    if (response.status === 401) {
      navigate('/login');
      return null;
    }

    if (response.status === 404) {
      const data = await response.json();
      if (data.message?.includes('preferences')) {
        navigate('/complete-profile');
      }
      return null;
    }

    if (response.status === 429) {
      alert('Please wait a few seconds and try again');
      return null;
    }

    if (response.status === 422) {
      const data = await response.json();
      console.error('Validation errors:', data.detail);
      return null;
    }

    // Generic error
    console.error('API error:', response.status);
    return null;

  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

// Usage
const recommendations = await handleApiCall('/api/listings/recommendations');
const bio = await handleApiCall('/api/ai/generate-bio', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': currentUser.id.toString()
  },
  body: JSON.stringify({ hobbies: '...', personality: '...' })
});
```

---

## BEST PRACTICES

### 1. Always Include Credentials

```javascript
// ✅ CORRECT
fetch('/api/listings/recommendations', {
  credentials: 'include'  // Sends JWT cookie
})

// ❌ WRONG
fetch('/api/listings/recommendations')  // Cookie not sent!
```

---

### 2. X-User-Id Header for Bio Generation

```javascript
// ✅ CORRECT
headers: {
  'X-User-Id': currentUser.id.toString()  // Must be string
}

// ❌ WRONG
headers: {
  'X-User-Id': currentUser.id  // Number won't work
}
```

---

### 3. Handle Loading States

```javascript
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadData();
}, []);

async function loadData() {
  setLoading(true);
  try {
    // fetch data
  } finally {
    setLoading(false);  // Always set to false
  }
}
```

---

### 4. Show Match Percentages, Not Decimals

```javascript
// ✅ CORRECT
const percentage = Math.round(aiScore * 100);  // 0.866 → 87%
<div>{percentage}% Match</div>

// ❌ WRONG
<div>{aiScore} Match</div>  // Shows 0.866
```

---

### 5. Validate Bio Input Before Sending

```javascript
function validateBioInput(data) {
  if (!data.hobbies || data.hobbies.trim() === '') {
    return 'Hobbies are required';
  }
  
  if (!data.personality || data.personality.trim() === '') {
    return 'Personality is required';
  }
  
  if (data.hobbies.length > 200) {
    return 'Hobbies must be under 200 characters';
  }
  
  if (data.personality.length > 200) {
    return 'Personality must be under 200 characters';
  }
  
  return null;  // Valid
}

// Usage
const error = validateBioInput(formData);
if (error) {
  alert(error);
  return;
}
```

---

### 6. Cache Recommendations

```javascript
// Cache for 5 minutes to avoid excessive API calls
const CACHE_DURATION = 5 * 60 * 1000;
let recommendationsCache = null;
let cacheTimestamp = null;

async function getRecommendations() {
  const now = Date.now();
  
  // Return cached data if fresh
  if (recommendationsCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
    return recommendationsCache;
  }
  
  // Fetch fresh data
  const data = await fetch('/api/listings/recommendations', {
    credentials: 'include'
  }).then(r => r.json());
  
  // Update cache
  recommendationsCache = data;
  cacheTimestamp = now;
  
  return data;
}
```

---

### 7. Debounce Bio Generation Button

```javascript
import { useState } from 'react';

function useBioGeneration() {
  const [generating, setGenerating] = useState(false);
  const [lastGenTime, setLastGenTime] = useState(0);

  async function generateBio(data) {
    const now = Date.now();
    
    // Prevent spam (5 second cooldown)
    if (now - lastGenTime < 5000) {
      alert('Please wait before generating again');
      return null;
    }
    
    setGenerating(true);
    setLastGenTime(now);
    
    try {
      const response = await fetch('/api/ai/generate-bio', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString()
        },
        body: JSON.stringify(data)
      });
      
      return await response.json();
    } finally {
      setGenerating(false);
    }
  }

  return { generateBio, generating };
}
```

---

## TESTING

### Test Recommendations

```javascript
// Test in browser console
fetch('/api/listings/recommendations', { credentials: 'include' })
  .then(r => r.json())
  .then(data => {
    console.log('Top match:', data.recommendation.title);
    console.log('AI score:', Math.round(data.aiScore * 100) + '%');
    console.log('Algorithm:', data.algorithm);
  });
```

---

### Test Bio Generation

```javascript
// Test in browser console
fetch('/api/ai/generate-bio', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': '1'  // Replace with actual user ID
  },
  body: JSON.stringify({
    hobbies: 'gaming, cooking',
    personality: 'quiet, friendly'
  })
})
  .then(r => r.json())
  .then(data => console.log('Generated bio:', data.bio));
```

---

## QUICK REFERENCE

### Endpoints Summary

| Feature | Method | Endpoint | Auth | Description |
|---------|--------|----------|------|-------------|
| Get Recommendations | GET | `/api/listings/recommendations` | ✅ | Get AI-powered listing recommendations |
| Generate Bio | POST | `/api/ai/generate-bio` | ✅ | Generate profile bio with AI |

---

### Required Headers

**Recommendations:**
```javascript
{
  credentials: 'include'  // JWT cookie
}
```

**Bio Generation:**
```javascript
{
  credentials: 'include',
  'Content-Type': 'application/json',
  'X-User-Id': currentUser.id.toString()
}
```

---

### Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Use the data |
| 401 | Unauthorized | Redirect to login |
| 404 | Not found | Show error or redirect to profile setup |
| 422 | Validation error | Show field errors |
| 429 | Rate limit | Wait 5 seconds |
| 500 | Server error | Show generic error, retry later |

---

## SUPPORT

**Questions?** Contact the backend developer (Younes)

**API Issues?** Check:
1. Are you logged in? (JWT cookie present)
2. Is the user profile complete?
3. Are there any console errors?
4. Check Network tab in DevTools

**Last Updated:** March 9, 2026  
**Backend Version:** 1.0.0  
**Status:** ✅ Production Ready

---

**Happy Coding! 🚀**
