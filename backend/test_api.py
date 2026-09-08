import asyncio
import httpx
from app.main import app

async def test_backend():
    print("[PulseOps Test] Starting test suite...")
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health check
        res = await client.get("/api/v1/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print("  [PASS] /api/v1/health passed:", res.json()["status"])

        # 2. List tickets
        res = await client.get("/api/v1/tickets")
        assert res.status_code == 200
        tickets = res.json()
        assert len(tickets) >= 6, f"Expected at least 6 tickets, got {len(tickets)}"
        print(f"  [PASS] /api/v1/tickets passed: Retrieved {len(tickets)} tickets.")

        # 3. Create a ticket (test auto-triage)
        payload = {
            "customer_name": "Test Customer",
            "customer_email": "test@domain.com",
            "category": "billing",
            "subject": "Unauthorized charge of $499 on credit card",
            "description": "I did not authorize this charge! Payment failed alert."
        }
        res = await client.post("/api/v1/tickets", json=payload)
        assert res.status_code == 201
        created = res.json()
        assert created["priority"] == "critical", f"Expected CRITICAL priority, got {created['priority']}"
        assert created["sla_target_hours"] == 2.0, f"Expected 2h SLA, got {created['sla_target_hours']}"
        print(f"  [PASS] /api/v1/tickets POST passed: {created['ticket_number']} triaged to {created['priority'].upper()} with {created['sla_target_hours']}h SLA.")

        # 4. Status update
        res = await client.patch(f"/api/v1/tickets/{created['id']}/status", json={"status": "in_progress", "note": "Assigned to on-call engineer"})
        assert res.status_code == 200
        updated = res.json()
        assert updated["status"] == "in_progress"
        print("  [PASS] Status update to IN_PROGRESS passed.")

        # 5. Add message
        res = await client.post(f"/api/v1/tickets/{created['id']}/messages", json={
            "sender_name": "Agent Alex",
            "role": "agent",
            "content": "Hi, we are verifying the transaction ID with our merchant gateway right now."
        })
        assert res.status_code == 200
        print("  [PASS] Adding message to conversation passed.")

        # 6. Analytics summary
        res = await client.get("/api/v1/analytics")
        assert res.status_code == 200
        analytics = res.json()
        assert analytics["total_tickets"] >= 7
        print(f"  [PASS] /api/v1/analytics passed: Total: {analytics['total_tickets']}, Compliance: {analytics['sla_compliance_rate']}%")

    print("\n[PulseOps Test] All backend tests PASSED successfully!")

if __name__ == "__main__":
    asyncio.run(test_backend())
