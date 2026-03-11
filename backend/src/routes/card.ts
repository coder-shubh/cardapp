import { Router } from 'express';
import { getCardByUsername } from '../controllers/cardController.js';
import { getVCard } from '../controllers/vcardController.js';
import {
  recordView,
  recordLinkClick,
  recordQR,
  recordNFC,
} from '../controllers/analyticsController.js';

const router = Router();

router.get('/:username', getCardByUsername);
router.get('/:username/vcard', getVCard);
router.post('/:username/view', recordView);
router.post('/:username/link-click', recordLinkClick);
router.post('/:username/qr', recordQR);
router.post('/:username/nfc', recordNFC);

export default router;
