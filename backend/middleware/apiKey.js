module.exports = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ message: 'API key missing' });
  }

  req.apiKey = apiKey;
  next();
};
