const express = require('express');
const router = express.Router();
const assetsController = require('../controllers/assetsController');
const apiKeyAuth = require('../middleware/apiKey'); // ✅ Only this now

// ✅ Use only API key for auth
router.use(apiKeyAuth);

router.get('/', assetsController.getAllAssets);
router.get('/:id', assetsController.getAssetById);
router.post('/', assetsController.createAsset);
router.put('/:id', assetsController.updateAsset);
router.delete('/:id', assetsController.softDeleteAsset);

module.exports = router;
