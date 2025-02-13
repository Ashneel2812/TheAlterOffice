// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // States for short URL creation
  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [topic, setTopic] = useState('');
  // Instead of storing only the URL, we now store an object with shortUrl and createdAt
  const [shortUrlData, setShortUrlData] = useState(null);

  // States for analytics by alias (includes overall if alias === "overall")
  const [analyticsAlias, setAnalyticsAlias] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);

  // States for analytics by topic
  const [topicForAnalytics, setTopicForAnalytics] = useState('');
  const [topicAnalyticsData, setTopicAnalyticsData] = useState(null);

  // State for testing redirection
  const [redirectionAlias, setRedirectionAlias] = useState('');

  // Error message state
  const [error, setError] = useState('');

  // On load, check if user has been redirected after login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('loggedIn') === 'true') {
      setIsAuthenticated(true);
      // Optionally remove the query parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Redirect to Google OAuth login on backend
  const handleLogin = () => {
    window.location.href = 'https://alteroffice-backend-two.vercel.app/auth/google';
  };

  // Create a new short URL
  const handleCreateShortUrl = async (e) => {
    e.preventDefault();
    setError('');
    setShortUrlData(null);
    try {
      const response = await fetch('https://alteroffice-backend-two.vercel.app/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ longUrl: 'https://example.com', customAlias: 'alias', topic: 'test' }),
      });
      const data = await response.json();
      if (response.ok) {
        // Expecting response to contain both shortUrl and createdAt
        setShortUrlData(data);
      } else {
        // Set the error message returned by the API (for example, "Alias already exists")
        setError(data.message || 'Error creating short URL');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };
  

  // Get analytics by alias (or overall if alias === "overall")
  const handleGetAnalytics = async (alias) => {
    setError('');
    setAnalyticsData(null);
    try {
      const response = await fetch(`https://alteroffice-backend-two.vercel.app/api/analytics/${alias}`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setAnalyticsData(data);
      } else {
        setError(data.message || 'Error fetching analytics');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  // Get analytics for a given topic
  const handleGetTopicAnalytics = async () => {
    setError('');
    setTopicAnalyticsData(null);
    try {
      const response = await fetch(`https://alteroffice-backend-two.vercel.app/api/analytics/topic/${topicForAnalytics}`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setTopicAnalyticsData(data);
      } else {
        setError(data.message || 'Error fetching topic analytics');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  // Test redirection by navigating to /api/shorten/:alias
  const handleTestRedirection = () => {
    // This will navigate the browser to the redirection URL.
    window.location.href = `https://alteroffice-backend-two.vercel.app/api/shorten/${redirectionAlias}`;
  };

  return (
    <div className="app-container">
      <h1>URL Shortener Dashboard</h1>
      {!isAuthenticated ? (
        <div className="login-container">
          <p>Please log in to use the app:</p>
          <button onClick={handleLogin}>Login with Google</button>
        </div>
      ) : (
        <>
          {/* Create Short URL Section */}
          <section className="section">
            <h2>Create Short URL</h2>
            <form onSubmit={handleCreateShortUrl}>
              <div className="form-group">
                <label>Long URL:</label>
                <input
                  type="url"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  placeholder="https://example.com/very-long-url"
                  required
                />
              </div>
              <div className="form-group">
                <label>Custom Alias (optional):</label>
                <input
                  type="text"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  placeholder="your-custom-alias"
                />
              </div>
              <div className="form-group">
                <label>Topic (optional):</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., coding, news"
                />
              </div>
              <button type="submit">Create Short URL</button>
            </form>
            {shortUrlData && (
              <div className="result">
                <p>
                  <strong>Short URL:</strong>{' '}
                  <a href={shortUrlData.shortUrl} target="_blank" rel="noopener noreferrer">
                    {shortUrlData.shortUrl}
                  </a>
                </p>
                <p>
                  <strong>Created At:</strong>{' '}
                  {new Date(shortUrlData.createdAt).toLocaleString()}
                </p>
              </div>
            )}
            {error && (
              <div className="error">
                <p>{error}</p>
              </div>
            )}
          </section>

          {/* Analytics by Alias / Overall Section */}
          <section className="section">
            <h2>Get Analytics by Alias (or Overall)</h2>
            <div className="alias-input">
              <label>Enter Alias:</label>
              <input
                type="text"
                value={analyticsAlias}
                onChange={(e) => setAnalyticsAlias(e.target.value)}
                placeholder="e.g., coding111 or overall"
              />
              <button onClick={() => handleGetAnalytics(analyticsAlias)}>Get Analytics</button>
            </div>
            {analyticsData && (
              <div className="result">
                <h3>Analytics Data</h3>
                <pre>{JSON.stringify(analyticsData, null, 2)}</pre>
              </div>
            )}
          </section>

          {/* Analytics by Topic Section */}
          <section className="section">
            <h2>Get Analytics by Topic</h2>
            <div className="topic-input">
              <label>Enter Topic Name:</label>
              <input
                type="text"
                value={topicForAnalytics}
                onChange={(e) => setTopicForAnalytics(e.target.value)}
                placeholder="e.g., coding"
              />
              <button onClick={handleGetTopicAnalytics}>Get Topic Analytics</button>
            </div>
            {topicAnalyticsData && (
              <div className="result">
                <h3>Topic Analytics Data</h3>
                <pre>{JSON.stringify(topicAnalyticsData, null, 2)}</pre>
              </div>
            )}
          </section>

          {/* Redirection Test Section */}
          <section className="section">
            <h2>Test Redirection</h2>
            <div className="redirection-input">
              <label>Enter Alias for Redirection:</label>
              <input
                type="text"
                value={redirectionAlias}
                onChange={(e) => setRedirectionAlias(e.target.value)}
                placeholder="e.g., alias_name"
              />
              <button onClick={handleTestRedirection}>Test Redirection</button>
            </div>
            <p>
              This will navigate your browser to <code>https://alteroffice-backend-two.vercel.app/api/shorten/your-alias</code>.
            </p>
            <p>**Use only alias name for redirection**</p>
          </section>

          {error && (
            <div className="error">
              <p>{error}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
