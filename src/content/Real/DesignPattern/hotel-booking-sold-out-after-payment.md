# Paid. Then sold out.

Topic: How hotel booking confirmation works — why the last room can sell on another site after a traveller has paid, and how authorizing the payment, booking with the supplier and capturing only after confirmation means a sold-out room never needs a refund.
Runtime: ~54s across 10 stages (1080x1920)
SEO title: How hotel booking confirmation works
Published: 2026-10-03

## What you will learn

- Why every booking site can sell the same last hotel room
- Why you authorize a payment at Pay and capture it after the supplier confirms
- What to do when the supplier does not answer at all

## Copy-paste for posting

**Instagram — opening line** (Instagram has no title field; this is what shows in the feed)

```
Paid. Then sold out.
```

**YouTube Shorts — title**

```
How hotel booking confirmation works #Shorts
```

**Description** (Instagram caption and Shorts description)

```
A traveller pays for the last hotel room. Two seconds later: "Booking failed. Refund in 5 to 7 working days." 🏨

Nine seconds earlier, another site had sold that room.

WHY IT HAPPENS
Only the hotel owns the room. Its channel manager copies availability to every booking site, seconds to minutes late. Every site sells the same last room until the hotel says no.

THE FIX: A BOOKING SAGA
1. Price check with the supplier before taking any money.
2. Authorize the payment: a hold, not a charge.
3. Book with the supplier, sending your own booking reference.
4. Confirmed? Capture the payment.
5. Sold out? Void the hold. Nothing charged, nothing to refund.

NO ANSWER IS NOT A NO
If the supplier times out, the room may be booked. Keep the hold and look the booking up by your reference: 1, 2, 5, 15, 30 minutes. Refunding on a timeout is how ghost bookings happen.

Supplier responses in this short are illustrative, not any real supplier's contract.

Full write-up: blog.msdevbuild.com/blog/hotel-booking-confirmation-payment-saga

Follow for system design and cloud engineering tips.

#systemdesign #traveltech #payments #sagapattern #azure #azureservicebus #softwarearchitecture #backenddeveloper #dotnet #interviewprep #msdevbuild
```

**SEO keywords**

```
how hotel booking confirmation works, hotel booking confirmation, how hotel booking works, booking system design, saga pattern, payment authorization and capture, manual capture, overbooking hotel, channel manager, same room booked twice, booking timeout reconcile, azure service bus scheduled messages, system design interview, systemdesign, traveltech, payments, sagapattern, azure, azureservicebus, softwarearchitecture, backenddeveloper, dotnet, interviewprep, msdevbuild
```

## Stage breakdown

01. **One room, two sites** (5200ms) — The last sea-view room for the long weekend, shown on your app and on another site.
02. **The other site is first** (5400ms) — At 21:13:56 another site books it. Your app still shows one room left.
03. **Pay first, ask later** (5800ms) — Your traveller is charged ₹13,688 at 21:14:05. Then the booking goes to the hotel.
04. **A week-long refund** (5200ms) — Every sold-out room becomes a refund that takes 5 to 7 working days.
05. **Nobody can lock the room** (5400ms) — Only the hotel owns the room. Every site sees a copy that is seconds to minutes late.
06. **Hold, don't charge** (5400ms) — At Pay, authorize the amount: the bank sets it aside, nothing is taken.
07. **Sold out? Void the hold** (5800ms) — The supplier says SOLD_OUT. Release the hold. Nothing charged, nothing to refund.
08. **Confirmed? Now capture** (5400ms) — The traveller picks a similar room. The supplier confirms, and only then is the hold charged.
09. **No answer? Ask again** (5600ms) — A timeout is not a no. Keep the hold and look the booking up by your own reference.
10. **Hold the money, charge after the room** (4800ms) — Price check, authorize, book, then capture or void. Reconcile anything unanswered.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
