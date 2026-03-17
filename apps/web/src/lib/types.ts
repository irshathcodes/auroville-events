export type Category = "workshop" | "event" | "class";
export type PaymentType = "paid" | "free" | "contribution";

export interface Event {
  isEvent: boolean;
  title: string | null;
  description: string | null;
  category: Category | null;
  placeName: string | null;
  location: string | null;
  locationLink: string | null;
  contactNo: string | null;
  paymentType: PaymentType | null;
  paymentAmount: string | null;
  startTime: string | null; // "HH:mm" or null
  endTime: string | null; // "HH:mm" or null
  date: string | null; // "YYYY-MM-DD" or null
  imageUrl: string | null;
  videoUrl: string | null;
}
