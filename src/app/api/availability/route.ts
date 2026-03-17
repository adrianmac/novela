import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { gte, lte, and, eq } from "drizzle-orm";
import { addDays, startOfDay, endOfDay, format } from "date-fns";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDateStr = searchParams.get("startDate");
  const endDateStr = searchParams.get("endDate");
  const staffId = searchParams.get("staffId");

  if (!startDateStr || !endDateStr) {
    return NextResponse.json({ error: "Missing startDate or endDate" }, { status: 400 });
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // Fetch all appointments in this range
  let conditions = [
    gte(appointments.date, startOfDay(startDate)),
    lte(appointments.date, endOfDay(endDate)),
  ];

  if (staffId && staffId !== 'any') {
    conditions.push(eq(appointments.staffId, staffId));
  }

  const bookedAppointments = await db.select({
    date: appointments.date,
    // duration: appointments.durationMinutes,
  })
  .from(appointments)
  .where(and(...conditions));

  // Generate all possible 30-min slots for each day in the range
  const slots: Record<string, { time: string; available: boolean }[]> = {};

  for (let d = new Date(startDate); d <= endDate; d = addDays(d, 1)) {
    const dayKey = format(d, 'yyyy-MM-dd');
    slots[dayKey] = [];

    // Store hours: 8am to 7pm (19:00)
    for (let hour = 8; hour < 19; hour++) {
      for (let min of [0, 30]) {
        const slotTime = new Date(d);
        slotTime.setHours(hour, min, 0, 0);

        // Check if this slot conflicts with any booked appointment
        const isBooked = bookedAppointments.some(appt => {
          const apptStart = new Date(appt.date);
          const apptEnd = new Date(apptStart.getTime() + 60 * 60000); // hardcode to 1hr for now

          // Overlap condition: slotStart < apptEnd AND slotEnd > apptStart
          const slotEnd = new Date(slotTime.getTime() + 30 * 60000);
          return slotTime < apptEnd && slotEnd > apptStart;
        });

        // Also don't show past slots as available if it's today
        const isPast = slotTime < new Date();

        slots[dayKey].push({
          time: format(slotTime, 'HH:mm'),
          available: !isBooked && !isPast
        });
      }
    }
  }

  return NextResponse.json({ slots });
}
