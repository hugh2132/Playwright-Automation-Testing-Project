import test, { expect, Page } from "@playwright/test";

const BASE_URL = "https://eventhub.rahulshettyacademy.com";
const email = "hughnguyen@gmail.com";
const password = "hughnguyen@123";
const loginAndGoToBooking = async (page: Page) => {
  await page.goto(BASE_URL);
  await page.getByPlaceholder("you@email.com").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page.getByText("Browse Events →")).toBeVisible();
};
test("Single ticket booking is eligible for refund", async ({ page }) => {
  //step 1
  await loginAndGoToBooking(page);
  //step 2
  await page.goto(`${BASE_URL}/events`);
  await page
    .getByTestId("event-card")
    .first()
    .getByTestId("book-now-btn")
    .click();
  await page.getByPlaceholder("Your full name").fill("Henry Nguyen");
  await page.getByPlaceholder("you@email.com").fill("henrynguyen@gmail.com");
  await page.getByPlaceholder("+91 98765 43210").fill("+918746596734");
  await page.locator("#confirm-booking").click();
  //step 3
  await page.getByRole("button", { name: "View My Bookings" }).click();
  await expect(page).toHaveURL(`${BASE_URL}/bookings`);
  await page
    .getByTestId("booking-card")
    .first()
    .getByRole("button", { name: "View Details" })
    .click();
  await expect(page.getByText("Booking Information")).toBeVisible();
  //step 4
  const bookingRef = await page.locator("span.font-mono.font-bold").innerText();
  const eventitle = await page.locator("h1").innerText();
  expect(bookingRef.charAt(0)).toBe(eventitle.charAt(0));

  //step 5
  await page.getByTestId("check-refund-btn").click();
  await expect(page.locator("#refund-spinner")).toBeVisible();
  // wait spinner is no longer visible within 6 seconds
  await expect(page.locator("#refund-spinner")).not.toBeVisible({
    timeout: 6000,
  });

  //step 6
  const refundResult = page.locator("#refund-result");
  await expect(refundResult).toBeVisible();

  const checkText = refundResult.filter({
    hasText: "Single-ticket bookings qualify for a full refund",
  });
  await expect(checkText).toBeVisible();
  //other way
  //await expect(refundResult).toContainText("Single-ticket bookings qualify for a full refund");
});

test("Group ticket booking is NOT eligible for refund", async ({
  page,
}) => {
  //step 1,2
  await loginAndGoToBooking(page);
  await page.goto(`${BASE_URL}/events`);
  const bookEvent = page.getByTestId("event-card").first();
  await bookEvent.getByTestId("book-now-btn").click();
  // new step
  await page.locator('button:has-text("+")').click();
  await page.locator('button:has-text("+")').click();

  await page.getByPlaceholder("Your full name").fill("Henry Nguyen");
  await page.getByPlaceholder("you@email.com").fill("henrynguyen@gmail.com");
  await page.getByPlaceholder("+91 98765 43210").fill("+918746596734");
  await page.locator("#confirm-booking").click();
  //step 3

  await page.getByRole("button", { name: "View My Bookings" }).click();
  await expect(page).toHaveURL(`${BASE_URL}/bookings`);
  await page
    .getByTestId("booking-card")
    .first()
    .getByRole("button", { name: "View Details" })
    .click();
  await expect(page.getByText("Booking Information")).toBeVisible();
  //step 4
  const bookingRef = await page.locator("span.font-mono.font-bold").innerText();
  const eventitle = await page.locator("h1").innerText();
  expect(bookingRef.charAt(0)).toBe(eventitle.charAt(0));

  //step 5
  await page.getByTestId("check-refund-btn").click();
  await expect(page.locator("#refund-spinner")).toBeVisible();
  // wait spinner is no longer visible within 6 seconds
  await expect(page.locator("#refund-spinner")).not.toBeVisible({
    timeout: 6000,
  });

  //step 6
  const refundResult = page.getByTestId("refund-result");
  await expect(refundResult).toBeVisible();
  await expect(refundResult).toContainText("Not eligible for refund.");
  await expect(refundResult).toContainText(
    "Group bookings (3 tickets) are non-refundable.",
  );
});
