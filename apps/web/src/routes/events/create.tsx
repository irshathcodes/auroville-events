import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient, type User } from "@/lib/auth-client";
import { eventsApi } from "@/lib/api";

export const Route = createFileRoute("/events/create")({
  component: CreateEventPage,
});

function CreateEventPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session, isPending: isSessionLoading } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      category: "event" as "workshop" | "event" | "class",
      image: "",
      place: "",
      address: "",
      locationLink: "",
      contactNo: "",
      payment: "free" as "free" | "contribution",
      paymentCurrency: "INR",
      avContributionAmount: "",
      guestContributionAmount: "",
      startDate: "",
      startTime: "",
      endTime: "",
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        const startDateTime = new Date(`${value.startDate}T${value.startTime}`);
        const endDateTime = value.endTime
          ? new Date(`${value.startDate}T${value.endTime}`)
          : undefined;

        const newEvent = await eventsApi.create({
          title: value.title,
          slug: value.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
          description: value.description,
          category: value.category,
          image: value.image,
          place: value.place,
          address: value.address,
          locationLink: value.locationLink || null,
          contactNo: value.contactNo || null,
          payment: value.payment,
          paymentCurrency:
            value.payment === "contribution" ? value.paymentCurrency : null,
          avContributionAmount:
            value.payment === "contribution" && value.avContributionAmount
              ? Number.parseFloat(value.avContributionAmount)
              : null,
          guestContributionAmount:
            value.payment === "contribution" && value.guestContributionAmount
              ? Number.parseFloat(value.guestContributionAmount)
              : null,
          startTime: startDateTime,
          endTime: endDateTime || null,
        });

        toast.success("Event created successfully!");
        navigate({ to: "/events/$slug", params: { slug: newEvent.slug } });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to create event");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  if (isSessionLoading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center py-12">Loading...</div>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Sign in Required</h2>
            <p className="text-muted-foreground mb-4">
              You need to sign in to create an event.
            </p>
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!(session.user as User).canCreateEvents) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Permission Required</h2>
            <p className="text-muted-foreground">
              You don't have permission to create events. Please contact an
              administrator.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field name="title">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Title *</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Event title"
                    required
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Description *</Label>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Describe your event..."
                    rows={5}
                    required
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="category">
              {(field) => (
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      if (value) field.handleChange(value as "workshop" | "event" | "class");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="class">Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field name="image">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Image URL *</Label>
                  <Input
                    id={field.name}
                    type="url"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
              )}
            </form.Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field name="place">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Place/Venue *</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Venue name"
                      required
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="address">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Address *</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Full address"
                      required
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field name="locationLink">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Map Link (optional)</Label>
                  <Input
                    id={field.name}
                    type="url"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="contactNo">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Contact Number (optional)</Label>
                  <Input
                    id={field.name}
                    type="tel"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
              )}
            </form.Field>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <form.Field name="startDate">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Date *</Label>
                    <Input
                      id={field.name}
                      type="date"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      required
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="startTime">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Start Time *</Label>
                    <Input
                      id={field.name}
                      type="time"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      required
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="endTime">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>End Time (optional)</Label>
                    <Input
                      id={field.name}
                      type="time"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field name="payment">
              {(field) => (
                <div className="space-y-2">
                  <Label>Payment *</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      if (value) field.handleChange(value as "free" | "contribution");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="contribution">Contribution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => state.values.payment}>
              {(payment) =>
                payment === "contribution" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                    <form.Field name="paymentCurrency">
                      {(field) => (
                        <div className="space-y-2">
                          <Label htmlFor={field.name}>Currency</Label>
                          <Select
                            value={field.state.value}
                            onValueChange={(value) => {
                              if (value) field.handleChange(value);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INR">INR</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="avContributionAmount">
                      {(field) => (
                        <div className="space-y-2">
                          <Label htmlFor={field.name}>Aurovillian Amount</Label>
                          <Input
                            id={field.name}
                            type="number"
                            min="0"
                            step="0.01"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="guestContributionAmount">
                      {(field) => (
                        <div className="space-y-2">
                          <Label htmlFor={field.name}>Guest Amount</Label>
                          <Input
                            id={field.name}
                            type="number"
                            min="0"
                            step="0.01"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                      )}
                    </form.Field>
                  </div>
                )
              }
            </form.Subscribe>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Creating..." : "Create Event"}
              </Button>
              <Link to="/">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
