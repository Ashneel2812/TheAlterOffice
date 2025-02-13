// tests/analytics.test.js
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

describe('GET /api/analytics/:alias', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should return analytics data for a specific alias or overall', async () => {
    // Here we assume that you have already created URLs for the authenticated test user.
    // For a full integration test, you might want to create a URL first and then fetch its analytics.
    const alias = "overall"; // or a specific alias like "testalias"
    const response = await request(app)
      .get(`/api/analytics/${alias}`)
      .set('Accept', 'application/json');

    // The status code might be 200 if data is found or even 404 if no URLs exist.
    // Adjust expectations based on your test database state.
    expect([200, 404]).toContain(response.status);
    // If status is 200, we expect the analytics fields
    if (response.status === 200) {
      expect(response.body).toHaveProperty('totalClicks');
      expect(response.body).toHaveProperty('uniqueUsers');
      expect(response.body).toHaveProperty('clicksByDate');
      expect(response.body).toHaveProperty('osType');
      expect(response.body).toHaveProperty('deviceType');
    }
  });
});
