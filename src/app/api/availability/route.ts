import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { gte, lte, and, eq } from "drizzle-orm";
import { addDays, startOfDay, endOfDay, format } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const staffId = searchParams.get("staffId");

    if (!startDateStr || !endDateStr) {
      return NextResponse.json({ error: "Missing startDate or endDate" }, { status: 400 });
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    if (endDate < startDate) {
      return NextResponse.json({ error: "endDate must be after startDate" }, { status: 400 });
    }

    const maxRange = 60 * 24 * 60 * 60 * 1000;
    if (endDate.getTime() - startDate.getTime() > maxRange) {
      return NextResponse.json({ error: "Date range too large (max 60 days)" }, { status: 400 });
    }

    let conditions = [
      gte(appointments.date, startOfDay(startDate)),
      lte(appointments.date, endOfDay(endDate)),
    ];

    if (staffId && staffId !== 'any') {
      conditions.push(eq(appointments.staffId, staffId));
    }

    const bookedAppointments = await db.select({
      date: appointments.date,
    })
    .from(appointments)
    .where(and(...conditions));

    const slots: Record<string, { time: string; available: boolean }[]> = {};

    for (let d = new Date(startDate); d <= endDate; d = addDays(d, 1)) {
      const dayKey = format(d, 'yyyy-MM-dd');
      slots[dayKey] = [];

      for (let hour = 8; hour < 19; hour++) {
        for (let min of [0, 30]) {
          const slotTime = new Date(d);
          slotTime.setHours(hour, min, 0, 0);

          const isBooked = bookedAppointments.some(appt => {
            const apptStart = new Date(appt.date);
            const apptEnd = new Date(apptStart.getTime() + 60 * 60000);
            const slotEnd = new Date(slotTime.getTime() + 30 * 60000);
            return slotTime < apptEnd && slotEnd > apptStart;
          });

          const isPast = slotTime < new Date();

          slots[dayKey].push({
            time: format(slotTime, 'HH:mm'),
            available: !isBooked && !isPast
          });
        }
      }
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Availability check error:", error);
    return NextResponse.json({ error: "Failed to check availability" }, { status: 500 });
  }
}
