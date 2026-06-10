using ALTAS.Models.Config;
using ALTAS.Models.DTO;
using ALTAS.Models.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ALTAS.Controllers
{
    public class QueueController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly IQueueRepository _repo;
        private readonly IHubContext<QueueHub> _hub;

        public QueueController(
            IConfiguration configuration,
            IQueueRepository repo,
            IHubContext<QueueHub> hub)
        {
            _configuration = configuration;
            _repo = repo;
            _hub = hub;
        }

        // ── Views ──────────────────────────────────────────────────
        public IActionResult QueueDisplay() => View();
        public IActionResult QueueTicketing() => View();

        // ── POST: /Queue/IssueTicket ───────────────────────────────
        [HttpPost]
        public async Task<IActionResult> IssueTicket(IssueTicketRequest req)
        {
            if (req.ServiceId <= 0)
                return BadRequest(new ApiResponseDTO { Success = false, Message = "Invalid service ID." });

            var result = await _repo.IssueTicketAsync(req.ServiceId);
            if (!result.Success) return BadRequest(result);

            // ── Broadcast new state to ALL connected clients ───────
            var state = await _repo.GetStateAsync();
            await _hub.Clients.All.SendAsync("ticketIssued", state);

            return Ok(result);
        }

        // ── POST: /Queue/CallNext ──────────────────────────────────
        [HttpPost]
        public async Task<IActionResult> CallNext(int ServiceId)
        {
            if (ServiceId <= 0)
                return BadRequest(new ApiResponseDTO { Success = false, Message = "Invalid service ID." });

            var result = await _repo.CallNextAsync(ServiceId);

            // ── Broadcast updated state ────────────────────────────
            var state = await _repo.GetStateAsync();
            await _hub.Clients.All.SendAsync("ticketCalled", state);

            return Ok(result);
        }

        // ── GET: /Queue/GetState ───────────────────────────────────
        [HttpGet]
        public async Task<IActionResult> GetState()
        {
            var state = await _repo.GetStateAsync();
            return Ok(state);
        }

        // ── POST: /Queue/Reset ─────────────────────────────────────
        [HttpPost]
        public async Task<IActionResult> Reset()
        {
            var result = await _repo.ResetAllAsync();

            // ── Notify all clients the queue was wiped ─────────────
            await _hub.Clients.All.SendAsync("queueReset");

            return Ok(result);
        }

        // ── Request models ─────────────────────────────────────────
        public class IssueTicketRequest { public int ServiceId { get; set; } }
        public class CallNextRequest { public int ServiceId { get; set; } }
    }
}