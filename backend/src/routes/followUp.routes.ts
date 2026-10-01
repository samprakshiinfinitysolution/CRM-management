import { Router } from 'express';
import {
  getFollowUps,
  getFollowUpSummary,
  createFollowUp,
  completeFollowUp,
  rescheduleFollowUp,
  deleteFollowUp,
} from '../controllers/followUp.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const followUpRouter = Router();

// All follow-up endpoints require authentication
followUpRouter.use(authenticateUser);

// GET /api/followups         — List follow-ups (role-scoped: SE sees own, TL sees all)
followUpRouter.get('/', getFollowUps);

// GET /api/followups/summary — Aggregated counts (due today, upcoming, overdue, completed)
followUpRouter.get('/summary', getFollowUpSummary);

// POST /api/followups        — Schedule a new follow-up
followUpRouter.post('/', createFollowUp);

// PATCH /api/followups/:id/complete   — Mark as completed
followUpRouter.patch('/:id/complete', completeFollowUp);

// PATCH /api/followups/:id/reschedule — Reschedule to new date/time
followUpRouter.patch('/:id/reschedule', rescheduleFollowUp);

// DELETE /api/followups/:id           — Soft-delete a follow-up
followUpRouter.delete('/:id', deleteFollowUp);

export default followUpRouter;
