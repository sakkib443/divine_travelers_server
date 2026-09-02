import express from 'express';
import { BookingController } from './booking.controller';
import { BookingValidation } from './booking.validation';
import { authMiddleware, authorizeRoles, optionalAuth } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

// ── Anyone can submit booking (auth optional for auto-fill)
router.post(
    '/',
    optionalAuth,
    validateRequest(BookingValidation.createBookingSchema),
    BookingController.createBooking
);

// ── Public: track a booking by tracking ID + contact (no login needed)
router.get('/track', BookingController.trackBooking);

// ── Admin: bell + sidebar badge — pending bookings (count + latest items)
router.get('/notifications', authMiddleware, authorizeRoles('admin'), BookingController.getNotifications);

// ── Admin: all bookings (filter by ?type=tour&status=pending)
router.get('/', authMiddleware, authorizeRoles('admin'), BookingController.getAllBookings);

// ── Admin: update status
router.patch(
    '/:id/status',
    authMiddleware,
    authorizeRoles('admin'),
    BookingController.updateStatus
);

// ── Admin: attach documents uploaded while applying.
router.patch(
    '/:id/documents',
    authMiddleware,
    authorizeRoles('admin'),
    BookingController.setDocuments
);

// ── Admin: add a remark to the history log
router.post(
    '/:id/remarks',
    authMiddleware,
    authorizeRoles('admin'),
    BookingController.addRemark
);

// ── Admin: set total amount
router.patch('/:id/amount', authMiddleware, authorizeRoles('admin'), BookingController.setAmount);

// ── Admin: record a manual/office payment
router.post('/:id/payments', authMiddleware, authorizeRoles('admin'), BookingController.addPayment);

// ── Invoice PDF download (admin)
router.get('/:id/invoice', authMiddleware, authorizeRoles('admin'), BookingController.downloadInvoice);

// ── Admin: delete
router.delete('/:id', authMiddleware, authorizeRoles('admin'), BookingController.deleteBooking);

export const BookingRoutes = router;
