export type Category = "workshop" | "event" | "class";
export type Payment = "contribution" | "free";

export interface Event {
  id: number;
  slug: string;
  image: string;
  title: string;
  description: string;
  category: Category;
  address: string;
  place: string;
  locationLink: string | null;
  contactNo: string | null;
  payment: Payment;
  paymentCurrency: string | null;
  guestContributionAmount: number | null;
  avContributionAmount: number | null;
  startTime: Date | string;
  endTime: Date | string | null;
  createdById: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type NewEvent = Omit<Event, "id" | "createdAt" | "updatedAt" | "createdById">;
