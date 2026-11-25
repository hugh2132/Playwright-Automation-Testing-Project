import test, { expect, Page } from "@playwright/test";
const BASE_URL = "https://eventhub.rahulshettyacademy.com/";
const email = "hughnguyen@gmail.com";
const password = "hughnguyen@123";
const login = async (page: Page) => {
  await page.goto(`${BASE_URL}login`);
  await page.getByPlaceholder("you@email.com").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.locator("#login-btn").click();
};
test("Assignment", async ({ page }) => {
  //step 1
  await login(page);
  await expect(
    page.getByRole("link", { name: "Browse Events →" }),
  ).toBeVisible();
  //step 2
  await page.goto(`${BASE_URL}admin/events`);
  const eventTitle = `Henry Concert ${Date.now()}`;
  await page.locator("#event-title-input").fill(eventTitle);
  await page
    .locator("#admin-event-form textarea")
    .fill("The best concert ever");
  await page.getByLabel("City").fill("HCM");
  await page.getByLabel("Venue").fill("The Global City");
  await page.getByLabel("Event Date & Time").fill("2026-11-07T16:07");
  await page.getByLabel("Price ($)").fill("100");
  await page.getByLabel("Total Seats").fill("50");
  await page.locator("#add-event-btn").click();

  await expect(page.getByText("Event created!")).toBeVisible();

  //step 3
  await page.goto(`${BASE_URL}events`);
  await page.waitForLoadState("networkidle");
  const eventCard = page.getByTestId("event-card");
  await expect(eventCard.first()).toBeVisible();

  //check event exist
  const targetCard = eventCard.filter({ hasText: eventTitle });
  await expect(targetCard).toBeVisible({ timeout: 5000 });

  const seatBeforeBooking = parseInt(
    await targetCard.getByText("seat").first().innerText(),
  );
  console.log(`Sear before booking : ${seatBeforeBooking}`);

  //step 4
  await targetCard.getByTestId("book-now-btn").click();

  //step 5
  await expect(
    page.locator("#ticket-count").filter({ hasText: "1" }),
  ).toBeVisible();
  await page.getByLabel("Full Name").fill("Kathy Phan");
  await page.locator("#customer-email").fill("kathyphan@gmail.com");
  await page.getByPlaceholder("+91 98765 43210").fill("+916835635745");
  await page.locator("#confirm-booking").click();

  //step 6
  const bookingRefCk = page.locator(".booking-ref");
  await expect(bookingRefCk.first()).toBeVisible();

  const bookingRef = (await bookingRefCk.innerText()).trim();
  expect(bookingRef.charAt(0)).toBe(eventTitle.charAt(0).toUpperCase());
  console.log(`Boonking confirm ${bookingRef}`);
  //step 7
  await page.getByRole("link", { name: "View My Bookings" }).click();
  await expect(page).toHaveURL(`${BASE_URL}/bookings`);
  const bookingCard = page.locator("#booking-card");
  await expect(bookingCard.first()).toBeVisible();
  const matchingCard = bookingCard.filter({
    has: page.locator(".booking-ref"),
    hasText: bookingRef,
  });
  expect(matchingCard).toBeVisible();

  //step 8
  await page.goto(`${BASE_URL}events`);
  await expect(eventCard.first()).toBeVisible();

  const updateCard = eventCard.filter({ hasText: eventTitle }).first();
  await expect(updateCard).toBeVisible();

  const seatAfterBooking = parseInt(
    await updateCard.getByText("seat").first().innerText(),
  );
  console.log(`Seat After Booking :${seatAfterBooking}`);
  expect(seatAfterBooking).toBe(seatBeforeBooking - 1);
});
