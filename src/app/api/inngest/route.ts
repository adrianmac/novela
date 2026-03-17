import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import {
  appointmentReminder24h,
  paymentOverdueCheck,
  dressReturnReminder,
  postEventReviewRequest,
  winBackCampaign
} from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    appointmentReminder24h,
    paymentOverdueCheck,
    dressReturnReminder,
    postEventReviewRequest,
    winBackCampaign
  ],
});
