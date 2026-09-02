// ===================================================================
// Divine Travelers - Invoice Service
// Professional A4 invoice PDF generator (PDFKit) for bookings
// ===================================================================

import PDFDocument from 'pdfkit';
import { IBooking, IPaymentEntry } from '../booking/booking.interface';
import { ISettings } from '../settings/settings.interface';

// ── Brand palette ──────────────────────────────────────────────
const COLORS = {
    primary: '#3590CF', // Divine Travelers blue
    accent: '#EF8C2C', // orange
    dark: '#0a1628', // near-black navy
    lightRow: '#f2f6fa', // zebra / light grey rows
    border: '#dfe6ee',
    muted: '#6b7a8d',
    white: '#ffffff',
    dueRed: '#c0392b',
    green: '#1e8f4e',
};

// A4 geometry (points) + margins
const PAGE = { width: 595.28, height: 841.89 };
const MARGIN = 48;
const CONTENT_W = PAGE.width - MARGIN * 2;

// ── Helpers ────────────────────────────────────────────────────

// Map a currency code to a short symbol/label used on the invoice.
const currencyLabel = (currency?: string): string => {
    const c = (currency || 'BDT').toUpperCase();
    if (c === 'BDT') return 'Tk';
    if (c === 'USD') return '$';
    if (c === 'EUR') return '€';
    if (c === 'GBP') return '£';
    return c;
};

// Format a number with thousands separators (e.g. 1250000 -> "1,250,000").
const formatNumber = (value: unknown): string => {
    const n = Number(value) || 0;
    return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

// "Tk 12,500" style money string.
const money = (value: unknown, currency?: string): string =>
    `${currencyLabel(currency)} ${formatNumber(value)}`;

// Friendly date (e.g. "02 Jul 2026").
const formatDate = (d?: Date | string): string => {
    const date = d ? new Date(d) : new Date();
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

// Human label for a booking type.
const typeLabel = (type?: string): string => {
    const map: Record<string, string> = {
        tour: 'Tour',
        hajj: 'Hajj / Umrah',
        study: 'Study',
    };
    return map[(type || '').toLowerCase()] || (type ? type : '—');
};

// Human label for payment status.
const paymentStatusLabel = (status?: string): string => {
    const map: Record<string, string> = {
        unpaid: 'UNPAID',
        partial: 'PARTIALLY PAID',
        paid: 'PAID',
        refunded: 'REFUNDED',
    };
    return map[(status || '').toLowerCase()] || 'UNPAID';
};

const invoiceNumber = (booking: IBooking & { _id?: unknown }): string => {
    if (booking.trackingId) return booking.trackingId;
    const id = booking._id ? String(booking._id) : '';
    return id ? `INV-${id.slice(-6).toUpperCase()}` : 'INV-000000';
};

/**
 * Generate a professional A4 invoice PDF for a booking.
 * Collects the PDFKit stream into a single Buffer.
 *
 * @param booking  A Booking document (or plain object with the same shape).
 * @param settings The site Settings singleton (contact info for the footer).
 */
export const generateInvoicePdf = (
    booking: IBooking & { _id?: unknown },
    settings?: Partial<ISettings> | null
): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
                bufferPages: true,
            });

            const chunks: Buffer[] = [];
            doc.on('data', (chunk: Buffer) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const currency = booking.currency || 'BDT';
            const payments: IPaymentEntry[] = Array.isArray(booking.payments)
                ? booking.payments
                : [];

            // ============================================================
            // 1. HEADER BAND
            // ============================================================
            const headerH = 96;
            doc.rect(0, 0, PAGE.width, headerH).fill(COLORS.dark);
            // accent stripe under the band
            doc.rect(0, headerH, PAGE.width, 4).fill(COLORS.accent);

            // Left: brand
            doc
                .fillColor(COLORS.white)
                .font('Helvetica-Bold')
                .fontSize(26)
                .text('DIVINE TRAVELERS', MARGIN, 26);
            doc
                .fillColor(COLORS.primary)
                .font('Helvetica-Bold')
                .fontSize(10)
                .text('Consultancy & Migration', MARGIN, 58);

            // Right: INVOICE meta (right-aligned block)
            const rightX = PAGE.width - MARGIN - 200;
            doc
                .fillColor(COLORS.accent)
                .font('Helvetica-Bold')
                .fontSize(24)
                .text('INVOICE', rightX, 26, { width: 200, align: 'right' });
            doc
                .fillColor(COLORS.white)
                .font('Helvetica')
                .fontSize(9)
                .text(`Invoice No: ${invoiceNumber(booking)}`, rightX, 60, {
                    width: 200,
                    align: 'right',
                })
                .text(`Date: ${formatDate(booking.createdAt)}`, rightX, 74, {
                    width: 200,
                    align: 'right',
                });

            let y = headerH + 24;

            // ============================================================
            // 2. BILL TO  +  BOOKING SUMMARY  (two columns)
            // ============================================================
            const colGap = 24;
            const colW = (CONTENT_W - colGap) / 2;
            const leftColX = MARGIN;
            const rightColX = MARGIN + colW + colGap;
            const boxTop = y;

            // -- Bill To (left) --
            doc
                .fillColor(COLORS.primary)
                .font('Helvetica-Bold')
                .fontSize(11)
                .text('BILL TO', leftColX, boxTop);
            doc
                .fillColor(COLORS.dark)
                .font('Helvetica-Bold')
                .fontSize(12)
                .text(booking.name || '—', leftColX, boxTop + 18, { width: colW });
            let billY = doc.y + 2;
            doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.muted);
            if (booking.email) {
                doc.text(booking.email, leftColX, billY, { width: colW });
                billY = doc.y;
            }
            if (booking.phone) {
                doc.text(booking.phone, leftColX, billY, { width: colW });
            }

            // -- Booking summary box (right) --
            const summaryRows: Array<[string, string]> = [
                ['Type', typeLabel(booking.type)],
                ['Service', booking.serviceName || '—'],
                ['Tracking ID', booking.trackingId || invoiceNumber(booking)],
                ['Status', (booking.status || 'pending').toUpperCase()],
            ];
            const rowH = 20;
            const summaryH = summaryRows.length * rowH + 16;
            doc
                .roundedRect(rightColX, boxTop, colW, summaryH, 6)
                .fillAndStroke(COLORS.lightRow, COLORS.border);

            let sy = boxTop + 10;
            summaryRows.forEach(([label, value]) => {
                doc
                    .fillColor(COLORS.muted)
                    .font('Helvetica')
                    .fontSize(9)
                    .text(label, rightColX + 12, sy + 4, { width: 78 });
                doc
                    .fillColor(COLORS.dark)
                    .font('Helvetica-Bold')
                    .fontSize(9.5)
                    .text(value, rightColX + 92, sy + 4, {
                        width: colW - 104,
                        align: 'right',
                        ellipsis: true,
                        height: rowH,
                    });
                sy += rowH;
            });

            // advance below the taller of the two columns
            y = Math.max(billY + 14, boxTop + summaryH) + 24;

            // ============================================================
            // 3. ITEMS TABLE (service -> amount)
            // ============================================================
            const tableX = MARGIN;
            const tableW = CONTENT_W;
            const amountColW = 130;
            const descColW = tableW - amountColW;
            const thH = 26;

            // header row (blue bg, white text)
            doc.rect(tableX, y, tableW, thH).fill(COLORS.primary);
            doc.font('Helvetica-Bold').fontSize(10);
            const thTextY = y + (thH - doc.currentLineHeight()) / 2;
            doc
                .fillColor(COLORS.white)
                .text('DESCRIPTION', tableX + 12, thTextY, { width: descColW - 12, characterSpacing: 0.4 })
                .text('AMOUNT', tableX + descColW, thTextY, {
                    width: amountColW - 12,
                    align: 'right',
                    characterSpacing: 0.4,
                });
            y += thH;

            // single item row = the booked service
            const itemRowH = 30;
            doc.rect(tableX, y, tableW, itemRowH).fillAndStroke(COLORS.white, COLORS.border);
            doc.font('Helvetica-Bold').fontSize(10);
            const itemTextY = y + (itemRowH - doc.currentLineHeight()) / 2;
            doc
                .fillColor(COLORS.dark)
                .text(booking.serviceName || typeLabel(booking.type), tableX + 12, itemTextY, {
                    width: descColW - 20,
                    ellipsis: true,
                })
                .text(money(booking.amount, currency), tableX + descColW, itemTextY, {
                    width: amountColW - 12,
                    align: 'right',
                });
            y += itemRowH + 18;

            // ============================================================
            // 4. PAYMENTS SUB-TABLE (zebra rows)
            // ============================================================
            doc
                .fillColor(COLORS.dark)
                .font('Helvetica-Bold')
                .fontSize(11)
                .text('Payment History', tableX, y);
            y += 18;

            // columns: Date | Method | Reference | Amount
            const pDateW = 90;
            const pMethodW = 90;
            const pAmountW = 110;
            const pRefW = tableW - pDateW - pMethodW - pAmountW;
            const pDateX = tableX;
            const pMethodX = pDateX + pDateW;
            const pRefX = pMethodX + pMethodW;
            const pAmountX = pRefX + pRefW;
            const pthH = 22;

            // sub-header (dark)
            doc.rect(tableX, y, tableW, pthH).fill(COLORS.dark);
            doc.fillColor(COLORS.white).font('Helvetica-Bold').fontSize(8.5);
            doc.text('DATE', pDateX + 10, y + 7, { width: pDateW - 10 });
            doc.text('METHOD', pMethodX, y + 7, { width: pMethodW });
            doc.text('REFERENCE', pRefX, y + 7, { width: pRefW });
            doc.text('AMOUNT', pAmountX, y + 7, { width: pAmountW - 10, align: 'right' });
            y += pthH;

            const prowH = 22;
            if (payments.length === 0) {
                doc.rect(tableX, y, tableW, prowH).fillAndStroke(COLORS.lightRow, COLORS.border);
                doc
                    .fillColor(COLORS.muted)
                    .font('Helvetica-Oblique')
                    .fontSize(9)
                    .text('No payments recorded yet.', tableX + 10, y + 6, {
                        width: tableW - 20,
                    });
                y += prowH;
            } else {
                payments.forEach((p, i) => {
                    const bg = i % 2 === 0 ? COLORS.white : COLORS.lightRow;
                    doc.rect(tableX, y, tableW, prowH).fillAndStroke(bg, COLORS.border);
                    doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.dark);
                    doc.text(formatDate(p.at), pDateX + 10, y + 6, { width: pDateW - 10 });
                    doc.text(
                        (p.method || 'cash').toUpperCase(),
                        pMethodX,
                        y + 6,
                        { width: pMethodW, ellipsis: true }
                    );
                    doc
                        .fillColor(COLORS.muted)
                        .text(p.reference || '—', pRefX, y + 6, {
                            width: pRefW - 6,
                            ellipsis: true,
                        });
                    doc
                        .fillColor(COLORS.dark)
                        .font('Helvetica-Bold')
                        .text(money(p.amount, currency), pAmountX, y + 6, {
                            width: pAmountW - 10,
                            align: 'right',
                        });
                    y += prowH;
                });
            }
            y += 24;

            // ============================================================
            // 5. TOTALS BLOCK (right-aligned)
            // ============================================================
            const totalsW = 250;
            const totalsX = PAGE.width - MARGIN - totalsW;
            const trH = 24;

            const drawTotalRow = (
                label: string,
                value: string,
                opts: { emphasize?: boolean; color?: string; bg?: string } = {}
            ) => {
                if (opts.bg) {
                    doc.roundedRect(totalsX, y, totalsW, trH, 4).fill(opts.bg);
                }
                doc.font(opts.emphasize ? 'Helvetica-Bold' : 'Helvetica').fontSize(opts.emphasize ? 11 : 10);
                const labelY = y + (trH - doc.currentLineHeight()) / 2;
                doc
                    .fillColor(opts.emphasize ? COLORS.white : COLORS.muted)
                    .text(label, totalsX + 12, labelY, { width: 110, characterSpacing: opts.emphasize ? 0.3 : 0 });
                doc.font('Helvetica-Bold').fontSize(opts.emphasize ? 12 : 10);
                const valueY = y + (trH - doc.currentLineHeight()) / 2;
                doc
                    .fillColor(opts.emphasize ? COLORS.white : opts.color || COLORS.dark)
                    .text(value, totalsX + 120, valueY, {
                        width: totalsW - 132,
                        align: 'right',
                    });
                y += trH;
            };

            // Total & Paid (plain rows with a divider), Due emphasized.
            drawTotalRow('Total', money(booking.amount, currency));
            doc
                .moveTo(totalsX, y)
                .lineTo(totalsX + totalsW, y)
                .strokeColor(COLORS.border)
                .stroke();
            drawTotalRow('Paid', money(booking.paidAmount, currency), { color: COLORS.green });
            // Due — emphasized band (orange if outstanding, green if cleared)
            const dueOutstanding = (Number(booking.dueAmount) || 0) > 0;
            drawTotalRow('Amount Due', money(booking.dueAmount, currency), {
                emphasize: true,
                bg: dueOutstanding ? COLORS.accent : COLORS.green,
            });

            // Payment status pill
            y += 8;
            const statusText = paymentStatusLabel(booking.paymentStatus);
            const pillW = 150;
            const pillX = totalsX + totalsW - pillW;
            let pillColor = COLORS.muted;
            const ps = (booking.paymentStatus || '').toLowerCase();
            if (ps === 'paid') pillColor = COLORS.green;
            else if (ps === 'partial') pillColor = COLORS.accent;
            else if (ps === 'refunded') pillColor = COLORS.primary;
            else pillColor = COLORS.dueRed;
            const pillH = 26;
            doc.roundedRect(pillX, y, pillW, pillH, pillH / 2).fill(pillColor);
            doc.font('Helvetica-Bold').fontSize(10);
            const pillTextY = y + (pillH - doc.currentLineHeight()) / 2;
            doc
                .fillColor(COLORS.white)
                .text(`STATUS: ${statusText}`, pillX, pillTextY, {
                    width: pillW,
                    align: 'center',
                    characterSpacing: 0.6,
                });
            y += pillH + 18;

            // ============================================================
            // 6. FOOTER  (contact + thank you + disclaimer)
            // ============================================================
            const footerY = PAGE.height - MARGIN - 92;
            const fy = Math.max(y, footerY);

            doc
                .moveTo(MARGIN, fy)
                .lineTo(PAGE.width - MARGIN, fy)
                .strokeColor(COLORS.border)
                .stroke();

            const contactPhone = settings?.contactPhone || '';
            const contactEmail = settings?.contactEmail || '';
            const address = settings?.address || '';

            doc
                .fillColor(COLORS.dark)
                .font('Helvetica-Bold')
                .fontSize(10)
                .text('Divine Travelers', MARGIN, fy + 12, {
                    width: CONTENT_W,
                });
            doc.font('Helvetica').fontSize(9).fillColor(COLORS.muted);
            const contactBits = [
                contactPhone ? `Phone: ${contactPhone}` : '',
                contactEmail ? `Email: ${contactEmail}` : '',
            ].filter(Boolean);
            if (contactBits.length) {
                doc.text(contactBits.join('    |    '), MARGIN, doc.y + 2, {
                    width: CONTENT_W,
                });
            }
            if (address) {
                doc.text(address, MARGIN, doc.y + 1, { width: CONTENT_W });
            }

            doc
                .fillColor(COLORS.primary)
                .font('Helvetica-Bold')
                .fontSize(9.5)
                .text('Thank you for choosing Divine Travelers.', MARGIN, doc.y + 8, {
                    width: CONTENT_W,
                });
            doc
                .fillColor(COLORS.muted)
                .font('Helvetica-Oblique')
                .fontSize(8)
                .text('This is a computer-generated invoice and does not require a signature.', MARGIN, doc.y + 2, {
                    width: CONTENT_W,
                });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

export const InvoiceService = { generateInvoicePdf };
