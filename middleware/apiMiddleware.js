const apiKey = process.env.API_KEY;

const checkApiKey = (req, res, next) => {
    // Check if the request is under the '/api' path
    if (req.baseUrl.startsWith('/api')) {
      const providedApiKey = req.headers['api-key'];
  
      if (!providedApiKey || providedApiKey !== apiKey) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }
  
    // API key is valid or not required, proceed to the next middleware
    next();
  };
  
module.exports = { checkApiKey };