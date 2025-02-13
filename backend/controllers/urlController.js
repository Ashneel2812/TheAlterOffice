const Url = require('../models/Url');
const redisClient = require('../config/redis');
const shortid = require('shortid');
const UAParser = require('ua-parser-js');

exports.createShortUrl = async (req, res) => {
  try {
    const { longUrl, customAlias, topic } = req.body;
    let alias = customAlias;
    if (alias) {
      const existing = await Url.findOne({ alias });
      if (existing) {
        return res.status(400).json({ message: 'Alias already in use.' });
      }
    } else {
      alias = shortid.generate();
    }

    const newUrl = new Url({
      longUrl,
      alias,
      topic: topic || 'general',
      createdBy: req.user._id
    });

    await newUrl.save();

    // Cache the mapping in Redis for 1 hour
    await redisClient.set(alias, longUrl, { EX: 3600 });

    res.json({ shortUrl: `http://localhost:${process.env.PORT || 5000}/${alias}`, createdAt: newUrl.createdAt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};


exports.redirectUrl = async (req, res) => {
  try {
    const { alias } = req.params;
    console.log(`Redirect request for alias: ${alias}`);
    
    // Directly use redisClient here
    const cachedUrl = await redisClient.get(alias);
    if (cachedUrl) {
      console.log(`Found cached URL for alias ${alias}: ${cachedUrl}`);
      const analyticsEntry = {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        timestamp: new Date()
      };
      console.log(`Logging analytics entry (from cache):`, analyticsEntry);
      await Url.updateOne({ alias }, { $push: { analytics: analyticsEntry } });
      return res.redirect(cachedUrl);
    }
    
    const urlData = await Url.findOne({ alias });
    if (!urlData) {
      console.log(`URL not found in database for alias: ${alias}`);
      return res.status(404).json({ message: 'URL not found.' });
    }
    console.log(`URL found in database: ${urlData.longUrl}`);
    
    // Update Redis cache for future requests
    await redisClient.set(alias, urlData.longUrl, { EX: 3600 });
    
    const analyticsEntry = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date()
    };
    console.log(`Logging analytics entry (from DB):`, analyticsEntry);
    await Url.updateOne({ alias }, { $push: { analytics: analyticsEntry } });
    
    return res.redirect(urlData.longUrl);
  } catch (err) {
    console.error(`Error during redirection for alias ${req.params.alias}:`, err);
    res.status(500).json({ message: 'Server error.' });
  }
};

  

  // exports.getUrlAnalytics = async (req, res) => {
  //   try {
  //     const { alias } = req.params;
  //     // Optionally ensure that only the owner can view analytics:
  //     const urlData = await Url.findOne({ alias, createdBy: req.user._id });
  //     if (!urlData) {
  //       console.log(`URL not found for alias: ${alias} and user: ${req.user._id}`);
  //       return res.status(404).json({ message: 'URL not found.' });
  //     }
  
  //     console.log(`Found URL data for alias ${alias}:`, urlData);
  
  //     const analytics = urlData.analytics;
  //     console.log(`Analytics entries:`, analytics);
  
  //     let totalClicks = analytics.length;
  //     let uniqueIps = new Set();
  //     let clicksByDateMap = {};
  //     let osTypeMap = {};       // { osName: { uniqueClicks, uniqueUsers: Set } }
  //     let deviceTypeMap = {};   // { deviceName: { uniqueClicks, uniqueUsers: Set } }
  //     const parser = new UAParser();
  
  //     analytics.forEach((entry, index) => {
  //       console.log(`Processing entry ${index}:`, entry);
  //       if (entry.ip) {
  //         uniqueIps.add(entry.ip);
  //         console.log(`Added IP: ${entry.ip}`);
  //       }
  
  //       // Group by date (YYYY-MM-DD)
  //       const date = new Date(entry.timestamp).toISOString().split('T')[0];
  //       clicksByDateMap[date] = (clicksByDateMap[date] || 0) + 1;
  //       console.log(`Date ${date}: count = ${clicksByDateMap[date]}`);
  
  //       // Parse the user agent for OS and device type
  //       parser.setUA(entry.userAgent);
  //       const result = parser.getResult();
  //       const osName = result.os.name || 'Unknown';
  //       // Some user agents may not include device type; default to 'desktop'
  //       const deviceName = result.device.type || 'desktop';
  
  //       console.log(`Parsed UA: OS = ${osName}, Device = ${deviceName}`);
  
  //       // OS aggregation
  //       if (!osTypeMap[osName]) {
  //         osTypeMap[osName] = { uniqueClicks: 0, uniqueUsers: new Set() };
  //       }
  //       osTypeMap[osName].uniqueClicks++;
  //       if (entry.ip) osTypeMap[osName].uniqueUsers.add(entry.ip);
  //       console.log(`OS aggregation for ${osName}:`, osTypeMap[osName]);
  
  //       // Device aggregation
  //       if (!deviceTypeMap[deviceName]) {
  //         deviceTypeMap[deviceName] = { uniqueClicks: 0, uniqueUsers: new Set() };
  //       }
  //       deviceTypeMap[deviceName].uniqueClicks++;
  //       if (entry.ip) deviceTypeMap[deviceName].uniqueUsers.add(entry.ip);
  //       console.log(`Device aggregation for ${deviceName}:`, deviceTypeMap[deviceName]);
  //     });
  
  //     console.log(`Unique IPs:`, Array.from(uniqueIps));
  //     console.log(`Clicks by date map:`, clicksByDateMap);
  //     console.log(`OS type map:`, osTypeMap);
  //     console.log(`Device type map:`, deviceTypeMap);
  
  //     const clicksByDate = Object.keys(clicksByDateMap).map(date => ({
  //       date,
  //       clickCount: clicksByDateMap[date]
  //     }));
  //     const osType = Object.keys(osTypeMap).map(os => ({
  //       osName: os,
  //       uniqueClicks: osTypeMap[os].uniqueClicks,
  //       uniqueUsers: osTypeMap[os].uniqueUsers.size
  //     }));
  //     const deviceType = Object.keys(deviceTypeMap).map(device => ({
  //       deviceName: device,
  //       uniqueClicks: deviceTypeMap[device].uniqueClicks,
  //       uniqueUsers: deviceTypeMap[device].uniqueUsers.size
  //     }));
  
  //     console.log('Final aggregated data:', {
  //       totalClicks,
  //       uniqueUsers: uniqueIps.size,
  //       clicksByDate,
  //       osType,
  //       deviceType
  //     });
  
  //     res.json({
  //       totalClicks,
  //       uniqueUsers: uniqueIps.size,
  //       clicksByDate,
  //       osType,
  //       deviceType
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ message: 'Server error.' });
  //   }
  // };
  
  exports.getUrlAnalytics = async (req, res) => {
    try {
      const { alias } = req.params;
      const parser = new UAParser();
  
      // If alias is "overall", aggregate analytics for all URLs by the user.
      if (alias.toLowerCase() === 'overall') {
        console.log(`Aggregating overall analytics for user: ${req.user._id}`);
        const urls = await Url.find({ createdBy: req.user._id });
        
        // Initialize overall aggregation counters
        let totalUrls = urls.length;
        let totalClicks = 0;
        let uniqueIps = new Set();
        let clicksByDateMap = {};
        let osTypeMap = {};     // { osName: { uniqueClicks, uniqueUsers: Set } }
        let deviceTypeMap = {}; // { deviceName: { uniqueClicks, uniqueUsers: Set } }
  
        // Process each URL's analytics
        urls.forEach(url => {
          url.analytics.forEach(entry => {
            totalClicks++;
            if (entry.ip) uniqueIps.add(entry.ip);
  
            // Group clicks by date (format YYYY-MM-DD)
            const date = new Date(entry.timestamp).toISOString().split('T')[0];
            clicksByDateMap[date] = (clicksByDateMap[date] || 0) + 1;
  
            // Parse user agent for OS and device type
            parser.setUA(entry.userAgent);
            const result = parser.getResult();
            const osName = result.os.name || 'Unknown';
            const deviceName = result.device.type || 'desktop';
  
            // Aggregate OS data
            if (!osTypeMap[osName]) {
              osTypeMap[osName] = { uniqueClicks: 0, uniqueUsers: new Set() };
            }
            osTypeMap[osName].uniqueClicks++;
            if (entry.ip) osTypeMap[osName].uniqueUsers.add(entry.ip);
  
            // Aggregate device data
            if (!deviceTypeMap[deviceName]) {
              deviceTypeMap[deviceName] = { uniqueClicks: 0, uniqueUsers: new Set() };
            }
            deviceTypeMap[deviceName].uniqueClicks++;
            if (entry.ip) deviceTypeMap[deviceName].uniqueUsers.add(entry.ip);
          });
        });
  
        // Convert aggregated maps to arrays for the response
        const clicksByDate = Object.keys(clicksByDateMap).map(date => ({
          date,
          clickCount: clicksByDateMap[date]
        }));
        const osType = Object.keys(osTypeMap).map(os => ({
          osName: os,
          uniqueClicks: osTypeMap[os].uniqueClicks,
          uniqueUsers: osTypeMap[os].uniqueUsers.size
        }));
        const deviceType = Object.keys(deviceTypeMap).map(device => ({
          deviceName: device,
          uniqueClicks: deviceTypeMap[device].uniqueClicks,
          uniqueUsers: deviceTypeMap[device].uniqueUsers.size
        }));
  
        console.log('Overall aggregated data:', {
          totalUrls,
          totalClicks,
          uniqueUsers: uniqueIps.size,
          clicksByDate,
          osType,
          deviceType
        });
  
        return res.json({
          totalUrls,
          totalClicks,
          uniqueUsers: uniqueIps.size,
          clicksByDate,
          osType,
          deviceType
        });
      } 
      // Otherwise, return analytics for the specific URL (alias)
      else {
        console.log(`Fetching analytics for alias: ${alias} and user: ${req.user._id}`);
        const urlData = await Url.findOne({ alias, createdBy: req.user._id });
        if (!urlData) {
          console.log(`URL not found for alias: ${alias} and user: ${req.user._id}`);
          return res.status(404).json({ message: 'URL not found.' });
        }
        console.log('Found URL data:', urlData);
        const analytics = urlData.analytics;
        
        let totalClicks = analytics.length;
        let uniqueIps = new Set();
        let clicksByDateMap = {};
        let osTypeMap = {};
        let deviceTypeMap = {};
  
        analytics.forEach(entry => {
          if (entry.ip) uniqueIps.add(entry.ip);
          const date = new Date(entry.timestamp).toISOString().split('T')[0];
          clicksByDateMap[date] = (clicksByDateMap[date] || 0) + 1;
  
          parser.setUA(entry.userAgent);
          const result = parser.getResult();
          const osName = result.os.name || 'Unknown';
          const deviceName = result.device.type || 'desktop';
  
          if (!osTypeMap[osName]) {
            osTypeMap[osName] = { uniqueClicks: 0, uniqueUsers: new Set() };
          }
          osTypeMap[osName].uniqueClicks++;
          if (entry.ip) osTypeMap[osName].uniqueUsers.add(entry.ip);
  
          if (!deviceTypeMap[deviceName]) {
            deviceTypeMap[deviceName] = { uniqueClicks: 0, uniqueUsers: new Set() };
          }
          deviceTypeMap[deviceName].uniqueClicks++;
          if (entry.ip) deviceTypeMap[deviceName].uniqueUsers.add(entry.ip);
        });
  
        const clicksByDate = Object.keys(clicksByDateMap).map(date => ({
          date,
          clickCount: clicksByDateMap[date]
        }));
        const osType = Object.keys(osTypeMap).map(os => ({
          osName: os,
          uniqueClicks: osTypeMap[os].uniqueClicks,
          uniqueUsers: osTypeMap[os].uniqueUsers.size
        }));
        const deviceType = Object.keys(deviceTypeMap).map(device => ({
          deviceName: device,
          uniqueClicks: deviceTypeMap[device].uniqueClicks,
          uniqueUsers: deviceTypeMap[device].uniqueUsers.size
        }));
  
        console.log('Aggregated data for alias:', {
          totalClicks,
          uniqueUsers: uniqueIps.size,
          clicksByDate,
          osType,
          deviceType
        });
  
        return res.json({
          totalClicks,
          uniqueUsers: uniqueIps.size,
          clicksByDate,
          osType,
          deviceType
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error.' });
    }
  };
  
exports.getTopicAnalytics = async (req, res) => {
  try {
    const { topic } = req.params;
    // Find URLs with the given topic created by the authenticated user
    const urls = await Url.find({ topic, createdBy: req.user._id });
    if (!urls || urls.length === 0) {
      return res.status(404).json({ message: 'No URLs found for this topic.' });
    }

    let totalClicks = 0;
    let uniqueIps = new Set();
    let clicksByDateMap = {};
    let osTypeMap = {};
    let deviceTypeMap = {};
    const parser = new UAParser();

    urls.forEach(url => {
      url.analytics.forEach(entry => {
        totalClicks++;
        if (entry.ip) uniqueIps.add(entry.ip);

        const date = new Date(entry.timestamp).toISOString().split('T')[0];
        clicksByDateMap[date] = (clicksByDateMap[date] || 0) + 1;

        parser.setUA(entry.userAgent);
        const result = parser.getResult();
        const osName = result.os.name || 'Unknown';
        const deviceName = result.device.type || 'desktop';

        if (!osTypeMap[osName]) {
          osTypeMap[osName] = { uniqueClicks: 0, uniqueUsers: new Set() };
        }
        osTypeMap[osName].uniqueClicks++;
        if (entry.ip) osTypeMap[osName].uniqueUsers.add(entry.ip);

        if (!deviceTypeMap[deviceName]) {
          deviceTypeMap[deviceName] = { uniqueClicks: 0, uniqueUsers: new Set() };
        }
        deviceTypeMap[deviceName].uniqueClicks++;
        if (entry.ip) deviceTypeMap[deviceName].uniqueUsers.add(entry.ip);
      });
    });

    const clicksByDate = Object.keys(clicksByDateMap).map(date => ({
      date,
      clickCount: clicksByDateMap[date]
    }));
    const osType = Object.keys(osTypeMap).map(os => ({
      osName: os,
      uniqueClicks: osTypeMap[os].uniqueClicks,
      uniqueUsers: osTypeMap[os].uniqueUsers.size
    }));
    const deviceType = Object.keys(deviceTypeMap).map(device => ({
      deviceName: device,
      uniqueClicks: deviceTypeMap[device].uniqueClicks,
      uniqueUsers: deviceTypeMap[device].uniqueUsers.size
    }));

    // Also include a list of URLs with individual analytics if desired
    const urlsData = urls.map(u => ({
      shortUrl: `http://localhost:${process.env.PORT || 5000}/${u.alias}`,
      totalClicks: u.analytics.length,
      uniqueUsers: new Set(u.analytics.map(entry => entry.ip)).size
    }));

    res.json({
      totalClicks,
      uniqueUsers: uniqueIps.size,
      clicksByDate,
      urls: urlsData,
      osType,
      deviceType
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};


exports.getOverallAnalytics = async (req, res) => {
  try {
    const urls = await Url.find({ createdBy: req.user._id });
    // Instead of returning "URL not found", return zeroed analytics if no URLs exist.
    if (!urls || urls.length === 0) {
      return res.json({
        totalUrls: 0,
        totalClicks: 0,
        uniqueUsers: 0,
        clicksByDate: [],
        osType: [],
        deviceType: []
      });
    }

    let totalUrls = urls.length;
    let totalClicks = 0;
    let uniqueIps = new Set();
    let clicksByDateMap = {};
    let osTypeMap = {};
    let deviceTypeMap = {};
    const parser = new UAParser();

    urls.forEach(url => {
      url.analytics.forEach(entry => {
        totalClicks++;
        if (entry.ip) uniqueIps.add(entry.ip);

        const date = new Date(entry.timestamp).toISOString().split('T')[0];
        clicksByDateMap[date] = (clicksByDateMap[date] || 0) + 1;

        parser.setUA(entry.userAgent);
        const result = parser.getResult();
        const osName = result.os.name || 'Unknown';
        const deviceName = result.device.type || 'desktop';

        if (!osTypeMap[osName]) {
          osTypeMap[osName] = { uniqueClicks: 0, uniqueUsers: new Set() };
        }
        osTypeMap[osName].uniqueClicks++;
        if (entry.ip) osTypeMap[osName].uniqueUsers.add(entry.ip);

        if (!deviceTypeMap[deviceName]) {
          deviceTypeMap[deviceName] = { uniqueClicks: 0, uniqueUsers: new Set() };
        }
        deviceTypeMap[deviceName].uniqueClicks++;
        if (entry.ip) deviceTypeMap[deviceName].uniqueUsers.add(entry.ip);
      });
    });

    const clicksByDate = Object.keys(clicksByDateMap).map(date => ({
      date,
      clickCount: clicksByDateMap[date]
    }));
    const osType = Object.keys(osTypeMap).map(os => ({
      osName: os,
      uniqueClicks: osTypeMap[os].uniqueClicks,
      uniqueUsers: osTypeMap[os].uniqueUsers.size
    }));
    const deviceType = Object.keys(deviceTypeMap).map(device => ({
      deviceName: device,
      uniqueClicks: deviceTypeMap[device].uniqueClicks,
      uniqueUsers: deviceTypeMap[device].uniqueUsers.size
    }));

    res.json({
      totalUrls,
      totalClicks,
      uniqueUsers: uniqueIps.size,
      clicksByDate,
      osType,
      deviceType
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

