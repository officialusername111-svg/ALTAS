using Microsoft.AspNetCore.SignalR;
using System.Text.RegularExpressions;

namespace ALTAS.Models.Config
{
    /// <summary>
    /// SignalR hub for real-time queue notifications.
    /// Groups:
    ///   "display"  – QueueDisplay screens
    ///   "staff"    – Staff / counter pages (uses the layout panel)
    /// </summary>
    public class QueueHub : Hub
    {
        // ── Client-side methods the server can invoke ──────────────
        //
        //   ticketIssued   (QueueStateDTO state)
        //      → A new ticket was just issued; refresh everything.
        //
        //   ticketCalled   (QueueStateDTO state)
        //      → Staff clicked "Call Next"; update Now Serving + queues.
        //
        //   queueReset     ()
        //      → All tickets cleared for the day.

        public override async Task OnConnectedAsync()
        {
            // Clients self-join their group by passing ?group=display or ?group=staff
            var group = Context.GetHttpContext()?.Request.Query["group"].ToString();
            if (!string.IsNullOrWhiteSpace(group))
                await Groups.AddToGroupAsync(Context.ConnectionId, group);

            await base.OnConnectedAsync();
        }
    }
}
