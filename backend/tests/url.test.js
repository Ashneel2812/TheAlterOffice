// tests/url.test.js
const request = require('supertest');
const app = require('../app'); // ensure this exports your Express app instance
const mongoose = require('mongoose');

process.env.MONGO_URI_TEST = process.env.MONGO_URI_TEST || process.env.MONGO_URI;

// Example test for creating a short URL
describe('POST /api/shorten', () => {
  beforeAll(async () => {
    // Connect to your test database or use an in-memory database
    await mongoose.connect(process.env.MONGO_URI_TEST, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create a short URL and return shortUrl and createdAt', async () => {
    const payload = {
      longUrl: "https://example.com/very-long-url",
      customAlias: "testalias",
      topic: "testing"
    };

    // Here, add logic to simulate an authenticated user.
    // For example, if using sessions, you might need to handle cookies.
    const response = await request(app)
      .post('/api/shorten')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('shortUrl');
    expect(response.body).toHaveProperty('createdAt');
  });

  it('should return an error if alias already exists', async () => {
    const payload = {
      longUrl: "https://example.com/another-url",
      customAlias: "testalias", // reusing alias from previous test
      topic: "testing"
    };

    const response = await request(app)
      .post('/api/shorten')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Alias already in use.');
  });
});
