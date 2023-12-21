const checkRole = (req, res, next) => {

  console.log('Base URL:', req.baseUrl);
  console.log('Original URL:', req.originalUrl);
  console.log('Path:', req.path);
  console.log('Hostname:', req.hostname);
  console.log('Protocol:', req.protocol);
  console.log('Params:', req.params); // If you have route parameters

    next();

  };
  
module.exports = { checkRole };