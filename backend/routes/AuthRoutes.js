const facebookController = require('../controllers/facebookController');
router.get('/facebook', facebookController.facebookLogin);
router.get('/facebook/callback', facebookController.facebookCallback);
router.get('/facebook/pages', facebookController.getFacebookPages);
router.get('/facebook/status', facebookController.facebookStatus);
router.get('/logout', facebookController.facebookLogout);
router.get('/debug/session', facebookController.debugSession);