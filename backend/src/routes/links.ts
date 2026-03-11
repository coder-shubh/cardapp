import { Router } from 'express';
import {
  getLinks,
  createLink,
  updateLink,
  deleteLink,
  reorderLinks,
} from '../controllers/linksController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);
router.get('/', getLinks);
router.post('/', createLink);
router.put('/:id', updateLink);
router.delete('/:id', deleteLink);
router.post('/reorder', reorderLinks);

export default router;
