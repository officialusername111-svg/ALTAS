using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ALTAS.Models.DTO;
using ALTAS.Models;

namespace ALTAS.Reports
{
    public class KPForm8NoticeOfHearing : IDocument
    {
        public KPForm8NoticeOfHearingDTO Model { get; }
        private readonly string _logoPath;
        private readonly string _logoRightPath;

        public KPForm8NoticeOfHearing(KPForm8NoticeOfHearingDTO model, string logoPath, string logoRightPath)
        {
            Model = model;
            _logoPath = logoPath;
            _logoRightPath = logoRightPath;
        }

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Margin(50);
                page.Size(PageSizes.A4);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily(Fonts.TimesNewRoman));

                // Watermark
                page.Background().AlignCenter().AlignMiddle().Column(col =>
                {
                    if (System.IO.File.Exists(_logoPath))
                    {
                        var faded = new ReportBackGroundHelper().MakeTransparent(_logoPath, 0.12f);
                        col.Item().Width(320).Image(faded);
                    }
                });

                // Header
                page.Header().Column(col =>
                {
                    col.Item().AlignLeft().Text("KP Form No. 8").FontSize(9).Italic();

                    col.Item().PaddingTop(4).Row(row =>
                    {
                        if (System.IO.File.Exists(_logoPath))
                            row.ConstantItem(65).Image(_logoPath);
                        else
                            row.ConstantItem(65).Height(65).Placeholder();

                        row.RelativeItem().Column(h =>
                        {
                            h.Item().AlignCenter().Text("Republic of the Philippines").FontSize(8);
                            h.Item().AlignCenter().Text("Province of South Cotabato").FontSize(8);
                            h.Item().AlignCenter().Text("Municipality of Tupi").FontSize(8);
                            h.Item().AlignCenter().Text("BARANGAY POBLACION").Bold().FontSize(11);
                            h.Item().AlignCenter().Text("---oooOOOooo---").FontSize(9);
                        });

                        if (System.IO.File.Exists(_logoRightPath))
                            row.ConstantItem(65).Image(_logoRightPath);
                        else
                            row.ConstantItem(65).Height(65).Placeholder();
                    });

                    col.Item().PaddingTop(10).AlignCenter().Text("NOTICE OF HEARING").ExtraBold().FontSize(14);
                    col.Item().PaddingTop(2).AlignCenter().Text("(MEDIATION PROCEEDINGS)").Bold().FontSize(10);
                    col.Item().PaddingTop(6).LineHorizontal(0.5f).LineColor(Colors.Black);
                });

                // Content
                page.Content().PaddingTop(25).Column(col =>
                {
                    // Addressee block
                    col.Item().Text(t =>
                    {
                        t.Span("TO: ").Bold();
                        t.Span(Model.ToName).Bold();
                    });
                    col.Item().PaddingLeft(35).Text(Model.ToAddress).FontSize(10);
                    col.Item().PaddingLeft(35).Text(Model.ToRole).FontSize(10);

                    // Body paragraph
                    col.Item().PaddingTop(22).Text(t =>
                    {
                        t.DefaultTextStyle(s => s.FontSize(10));
                        t.Span("    You are hereby notified to appear before me on the ");
                        t.Span($"{Model.HearingDay} day of ");
                        t.Span(Model.HearingMonthYear).Bold();
                        t.Span($" at {Model.HearingTime} o'clock in the ");
                        t.Span(Model.HearingPeriod).Underline();
                        t.Span("/ afternoon for the hearing of your complaint.");
                    });

                    // Issuance date
                    col.Item().PaddingTop(20).Text($"    This {Model.DateIssued}.").FontSize(10);

                    // Punong Barangay signature
                    col.Item().PaddingTop(35).Row(row =>
                    {
                        row.RelativeItem();
                        row.ConstantItem(220).Column(sig =>
                        {
                            sig.Item().AlignCenter().Text(Model.PunongBarangay).Bold().FontSize(10);
                            sig.Item().Width(200).LineHorizontal(0.5f).LineColor(Colors.Black);
                            sig.Item().AlignCenter().Text("Punong Barangay/Lupon Chairperson").FontSize(9);
                        });
                    });

                    // Notification acknowledgement line
                    col.Item().PaddingTop(30).Text($"Notified {Model.NotifiedDate}.").FontSize(10);

                    // Complainant acknowledgement signature
                    col.Item().PaddingTop(35).Row(row =>
                    {
                        row.RelativeItem();
                        row.ConstantItem(220).Column(sig =>
                        {
                            sig.Item().AlignCenter().Text(Model.AcknowledgedBy).Bold().FontSize(10);
                            sig.Item().Width(200).LineHorizontal(0.5f).LineColor(Colors.Black);
                            sig.Item().AlignCenter().Text(Model.ToRole).FontSize(9);
                        });
                    });

                    // Receipt stamp
                    col.Item().PaddingTop(22).Column(rc =>
                    {
                        rc.Item().Text($"Time: {Model.TimeNotified}").FontSize(9);
                        rc.Item().Text($"Date: {Model.DateNotified}").FontSize(9);
                    });
                });
            });
        }
    }
}