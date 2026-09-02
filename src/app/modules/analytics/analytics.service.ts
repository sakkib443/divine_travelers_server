// ===================================================================
// Divine Travelers - Analytics Service
// Real financial & booking analytics for the admin dashboard
// ===================================================================

import { Booking } from '../booking/booking.model';
import { User } from '../user/user.model';
import { buildBookingFilter } from '../booking/booking.service';

const getDashboard = async () => {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Sparkline window: last 12 days (incl. today) for the mini trend charts on the main cards.
    const SPARK_DAYS = 12;
    const sparkStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (SPARK_DAYS - 1));
    // Map a date to its 0..SPARK_DAYS-1 bucket within the window (outside the window → -1).
    const dayBucket = (d: Date): number => {
        const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const idx = Math.round((day.getTime() - sparkStart.getTime()) / 86400000);
        return idx >= 0 && idx < SPARK_DAYS ? idx : -1;
    };

    const [
        totalClients,
        clientsThisMonth,
        clientsLastMonth,
        recentClients,
        bookings,
    ] = await Promise.all([
        Booking.distinct('email').then((emails) => emails.filter(Boolean).length),
        Booking.distinct('email', { createdAt: { $gte: startMonth } }).then((emails) => emails.filter(Boolean).length),
        Booking.distinct('email', { createdAt: { $gte: startLastMonth, $lt: startMonth } }).then((emails) => emails.filter(Boolean).length),
        Booking.find({ createdAt: { $gte: sparkStart } }).select('createdAt').lean(),
        Booking.find()
            .select('trackingId type status amount paidAmount dueAmount payments serviceName name details createdAt')
            .sort({ createdAt: -1 })
            .lean(),
    ]);

    let totalRevenue = 0;
    let totalDue = 0;
    let monthlyRevenue = 0;
    let lastMonthRevenue = 0;
    let todayRevenue = 0;
    let pendingApplications = 0;

    // Month-over-month counters (by booking createdAt) driving the change badges.
    let bookingsThisMonth = 0;
    let bookingsLastMonth = 0;
    let pendingThisMonth = 0;
    let pendingLastMonth = 0;

    // Daily series (last SPARK_DAYS days) for the main-card sparklines.
    const clientsSpark = new Array(SPARK_DAYS).fill(0);
    const applicationsSpark = new Array(SPARK_DAYS).fill(0);
    const revenueSpark = new Array(SPARK_DAYS).fill(0);
    const pendingSpark = new Array(SPARK_DAYS).fill(0);

    for (const u of recentClients as any[]) {
        const i = dayBucket(new Date(u.createdAt));
        if (i >= 0) clientsSpark[i] += 1;
    }

    const typeCounts: Record<string, number> = { tour: 0, hajj: 0 };

    for (const b of bookings as any[]) {
        totalRevenue += b.paidAmount || 0;
        totalDue += b.dueAmount || 0;
        if (typeCounts[b.type] !== undefined) typeCounts[b.type] += 1;

        const isPending = b.status === 'pending' || b.status === 'processing';
        if (isPending) pendingApplications += 1;

        const created = new Date(b.createdAt);
        const inThisMonth = created >= startMonth;
        const inLastMonth = created >= startLastMonth && created < startMonth;

        if (inThisMonth) bookingsThisMonth += 1;
        else if (inLastMonth) bookingsLastMonth += 1;
        if (isPending) {
            if (inThisMonth) pendingThisMonth += 1;
            else if (inLastMonth) pendingLastMonth += 1;
        }

        const cBucket = dayBucket(created);
        if (cBucket >= 0) {
            applicationsSpark[cBucket] += 1;
            if (isPending) pendingSpark[cBucket] += 1;
        }

        for (const p of b.payments || []) {
            const at = new Date(p.at);
            const amt = p.amount || 0;
            if (at >= startMonth) monthlyRevenue += amt;
            else if (at >= startLastMonth) lastMonthRevenue += amt;
            if (at >= startToday) todayRevenue += amt;
            const pBucket = dayBucket(at);
            if (pBucket >= 0) revenueSpark[pBucket] += amt;
        }
    }

    // Signed % change vs last month + the arrow direction. previous 0 → +100% if there is
    // any current activity, else 0%.
    const pctChange = (current: number, previous: number) => {
        const pct = previous === 0
            ? (current > 0 ? 100 : 0)
            : ((current - previous) / previous) * 100;
        const rounded = Math.round(pct * 10) / 10;
        return {
            change: `${rounded > 0 ? '+' : ''}${rounded}%`,
            trend: rounded >= 0 ? 'up' : 'down',
        };
    };

    // Display status: treat "confirmed" as "approved" for the dashboard table
    const displayStatus = (s: string) => (s === 'confirmed' ? 'approved' : s);

    const recentApplications = (bookings as any[]).slice(0, 6).map((b) => ({
        id: b.trackingId || String(b._id).slice(-6).toUpperCase(),
        name: b.name,
        date: new Date(b.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        type: b.type,
        country: b.serviceName,
        status: displayStatus(b.status),
    }));

    const upcomingTours = (bookings as any[])
        .filter((b) => b.type === 'tour')
        .slice(0, 5)
        .map((b) => ({
            name: b.serviceName,
            date: b.details?.travelDate || b.details?.date
                || new Date(b.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            travelers: b.details?.travelers || b.details?.numberOfTravelers || b.details?.persons || '—',
            revenue: b.amount || b.paidAmount || 0,
        }));

    return {
        totalClients,
        totalApplications: bookings.length,
        totalRevenue,
        totalDue,
        monthlyRevenue,
        todayRevenue,
        pendingApplications,
        tourBookings: typeCounts.tour,
        hajjBookings: typeCounts.hajj,
        totalBookings: bookings.length,
        // Real month-over-month change for the 4 main cards (this calendar month vs last).
        changes: {
            totalClients: pctChange(clientsThisMonth, clientsLastMonth),
            totalApplications: pctChange(bookingsThisMonth, bookingsLastMonth),
            totalRevenue: pctChange(monthlyRevenue, lastMonthRevenue),
            pendingApplications: pctChange(pendingThisMonth, pendingLastMonth),
        },
        // Real daily series (last 12 days) for the main-card sparklines.
        sparklines: {
            totalClients: clientsSpark,
            totalApplications: applicationsSpark,
            totalRevenue: revenueSpark,
            pendingApplications: pendingSpark,
        },
        recentApplications,
        upcomingTours,
    };
};

// ===================================================================
// Sales / data reports (admin) — client requirements section 5.
// Applies the SAME filters as GET /api/bookings (date/country/team/type/…)
// then aggregates the matching bookings into summary + time-series +
// per-country / per-team / per-type breakdowns.
// ===================================================================
// Period key for the time series: 'YYYY-MM-DD' (day) or 'YYYY-MM' (month).
const periodKey = (date: Date, groupBy: 'day' | 'month'): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    if (groupBy === 'month') return `${y}-${m}`;
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const getReports = async (query: Record<string, string> = {}) => {
    const filter = buildBookingFilter(query);
    const groupBy: 'day' | 'month' = query.groupBy === 'month' ? 'month' : 'day';

    // Pull only the fields the report needs from the filtered set.
    const bookings = await Booking.find(filter)
        .select('type status amount paidAmount dueAmount serviceName details assignedTo assignedToName createdAt')
        .lean();

    // Resolve team member names once (fallback for any assignedToName gaps).
    const teamMembers = await User.find({ role: 'admin', isDeleted: false }).select('firstName lastName').lean();
    const teamNameById: Record<string, string> = {};
    for (const m of teamMembers as any[]) {
        teamNameById[String(m._id)] = `${m.firstName} ${m.lastName}`.trim();
    }
    const teamIds = new Set(Object.keys(teamNameById));

    // Summary accumulators
    const summary = {
        totalBookings: bookings.length,
        totalRevenue: 0, // Σ paidAmount
        totalDue: 0, // Σ dueAmount
        totalQuoted: 0, // Σ amount
        byStatus: { pending: 0, processing: 0, confirmed: 0, cancelled: 0, rejected: 0 } as Record<string, number>,
    };

    const timeMap: Record<string, { bookings: number; revenue: number }> = {};
    const countryMap: Record<string, { bookings: number; revenue: number }> = {};
    const teamMap: Record<string, { bookings: number; revenue: number; confirmed: number }> = {};
    const typeMap: Record<string, { bookings: number; revenue: number }> = {};

    for (const b of bookings as any[]) {
        const paid = b.paidAmount || 0;

        summary.totalRevenue += paid;
        summary.totalDue += b.dueAmount || 0;
        summary.totalQuoted += b.amount || 0;
        if (summary.byStatus[b.status] !== undefined) summary.byStatus[b.status] += 1;

        // Time series
        const pk = periodKey(new Date(b.createdAt), groupBy);
        if (!timeMap[pk]) timeMap[pk] = { bookings: 0, revenue: 0 };
        timeMap[pk].bookings += 1;
        timeMap[pk].revenue += paid;

        // By country — prefer details.country, fall back to serviceName
        const country = (b.details && b.details.country) || b.serviceName || 'Unknown';
        if (!countryMap[country]) countryMap[country] = { bookings: 0, revenue: 0 };
        countryMap[country].bookings += 1;
        countryMap[country].revenue += paid;

        // By type
        if (!typeMap[b.type]) typeMap[b.type] = { bookings: 0, revenue: 0 };
        typeMap[b.type].bookings += 1;
        typeMap[b.type].revenue += paid;

        // By team — only bookings assigned to an actual team member
        if (b.assignedTo) {
            const key = String(b.assignedTo);
            if (teamIds.has(key)) {
                if (!teamMap[key]) teamMap[key] = { bookings: 0, revenue: 0, confirmed: 0 };
                teamMap[key].bookings += 1;
                teamMap[key].revenue += paid;
                if (b.status === 'confirmed') teamMap[key].confirmed += 1;
            }
        }
    }

    const timeSeries = Object.entries(timeMap)
        .map(([period, v]) => ({ period, bookings: v.bookings, revenue: v.revenue }))
        .sort((a, b) => a.period.localeCompare(b.period));

    const byCountry = Object.entries(countryMap)
        .map(([country, v]) => ({ country, bookings: v.bookings, revenue: v.revenue }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 15);

    const byTeam = Object.entries(teamMap)
        .map(([memberId, v]) => ({
            memberId,
            name: teamNameById[memberId] || 'Unknown',
            bookings: v.bookings,
            revenue: v.revenue,
            confirmed: v.confirmed,
        }))
        .sort((a, b) => b.bookings - a.bookings);

    const byType = Object.entries(typeMap)
        .map(([type, v]) => ({ type, bookings: v.bookings, revenue: v.revenue }))
        .sort((a, b) => b.bookings - a.bookings);

    return { summary, timeSeries, byCountry, byTeam, byType };
};

export const AnalyticsService = {
    getDashboard,
    getReports,
};
