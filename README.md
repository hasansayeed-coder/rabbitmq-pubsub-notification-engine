# Multi-Channel Notification Engine (RabbitMQ Pub/Sub Pattern)

A highly scalable, decoupled microservice event system built with Node.js, Express, and RabbitMQ Fanout Exchanges. This project simulates an enterprise-level architecture where a single user event (like a signup or purchase) triggers multiple isolated downstream notification actions (Email and SMS) in parallel without blocking the main API thread.

---

## 🏗️ Pub/Sub Architecture

Unlike standard direct message queues, this system utilizes a **Fanout Exchange** pattern to handle event broadcasting.



1. **The Producer (Express API):** Exposes a `POST /event` endpoint. It takes the payload and publishes it directly to the `notification_exchange`. It has zero knowledge of which queues or workers exist.
2. **The Fanout Exchange:** Acts as a broadcast tower. The moment a message lands, it duplicates the payload and pushes a copy into *every single queue* bound to it.
3. **The Dedicated Consumers:**
   * **Email Worker:** Listens to `email_queue`, handles heavy email rendering logs.
   * **SMS Worker:** Listens to `sms_queue`, handles short-form network dispatches.

---

## 🛡️ Resiliency & Independent Scaling Features

* **Zero-Coupling Expansion:** New worker microservices (e.g., Slack alerts, Analytics tracking) can be attached to the ecosystem at any time by simply creating a new queue and binding it to the existing `notification_exchange`. The core API requires zero downtime or re-configuration.
* **Isolated Fault Domains:** If the email dispatch system suffers an outage or network timeout, the SMS network continues to receive and process text notifications completely unaffected.
* **Guaranteed Delivery Network:** If a consumer crashes entirely, its specific cloud broker queue safely caches the duplicated payloads. The moment the worker reconnects, it drains the accumulated backlog chronologically without losing a single client notification.

---

## 🚀 Setup & Execution Guide

1. Clone and navigate into the repository directory.
2. Install dependencies: `npm install amqplib express dotenv`
3. Configure your local environment file (`.env`):
   ```text
   CLOUD_AMQP_URL=your_cloud_amqp_connection_string


Open 4 separate terminal panes and spin up the architecture components:

Terminal 1: node email-worker.js

Terminal 2: node sms-worker.js

Terminal 3: node publisher.js

Fire a test event broadcast using PowerShell in Terminal 4:

Invoke-RestMethod -Uri http://localhost:3000/event -Method Post -ContentType "application/json" -Body '{"user": "Alex", "action": "premium_signup"}'