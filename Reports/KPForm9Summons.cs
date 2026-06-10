using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ALTAS.Models.DTO;
using ALTAS.Models;

namespace ALTAS.Reports
{
    public class KPForm9Summons : IDocument
    {
        public KPForm9SummonsDTO Model { get; }
        private readonly string _logoPath;
        private readonly string _logoRightPath;

        public KPForm9Summons(KPForm9SummonsDTO model, string logoPath, string logoRightPath)
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
                    col.Item().AlignLeft().Text("KP Form No. 9").FontSize(9).Italic();

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
                            h.Item().AlignCenter().Text("--ooO0Ooo--").FontSize(9);
                            h.Item().PaddingTop(2).AlignCenter().Text("OFFICE OF THE LUPONG TAGAPAMAYAPA").FontSize(9);
                        });

                        if (System.IO.File.Exists(_logoRightPath))
                            row.ConstantItem(65).Image(_logoRightPath);
                        else
                            row.ConstantItem(65).Height(65).Placeholder();
                    });

                    col.Item().PaddingTop(8).LineHorizontal(0.5f).LineColor(Colors.Black);
                });

                // Content
                page.Content().PaddingTop(14).Column(col =>
                {
                    // Case header — parties left, case info right
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text(Model.ComplainantName).Bold().FontSize(11);
                            c.Item().Text(Model.ComplainantAddress).FontSize(9);
                            c.Item().Text("Complainant/s").FontSize(9);

                            c.Item().PaddingTop(8).Text("-Against-").Italic().FontSize(10);

                            c.Item().PaddingTop(8).Text(Model.RespondentName).Bold().FontSize(11);
                            c.Item().Text(Model.RespondentAddress).FontSize(9);
                            c.Item().Text("Respondent/s").FontSize(9);
                        });

                        row.ConstantItem(210).Column(c =>
                        {
                            c.Item().Text(t =>
                            {
                                t.Span("Barangay KP Case ").FontSize(9);
                                t.Span(Model.KPCaseNo).Bold().FontSize(9);
                            });
                            c.Item().PaddingTop(4).Text(t =>
                            {
                                t.Span("For: ").FontSize(9);
                                t.Span(Model.CaseType).Bold().FontSize(9);
                            });
                        });
                    });

                    // Title
                    col.Item().PaddingTop(18).AlignCenter().Text("SUMMONS").ExtraBold().FontSize(13);

                    // Addressee (Respondent)
                    col.Item().PaddingTop(14).Text(t =>
                    {
                        t.Span("TO: ").Bold();
                        t.Span(Model.RespondentName).Bold();
                    });
                    col.Item().PaddingLeft(35).Text(Model.RespondentAddress).FontSize(10);
                    col.Item().PaddingLeft(35).Text("Respondent/s").FontSize(10);

                    // Body paragraph 1
                    col.Item().PaddingTop(14).Text(t =>
                    {
                        t.DefaultTextStyle(s => s.FontSize(10));
                        t.Span("    You are hereby summoned to appear before me in person, on the ");
                        t.Span($"{Model.HearingDay} day ");
                        t.Span(Model.HearingMonthYear).Bold();
                        t.Span($" at {Model.HearingTime} o'clock in the ");
                        t.Span(Model.HearingPeriod).Underline();
                        t.Span(", then and there to answer to a complainant made before me, copy of which is attached hereto, for mediation/conciliation of your dispute with complainant/s.");
                    });

                    // Body paragraph 2
                    col.Item().PaddingTop(12).Text(t =>
                    {
                        t.DefaultTextStyle(s => s.FontSize(10));
                        t.Span("    You are hereby warned that if your refuse or willfully fail to appear in obedience to this summons, you may barred from filling any counterclaim arising from said complaint.");
                    });

                    // Body paragraph 3 — bold warning
                    col.Item().PaddingTop(12).Text("    FAIL NOT or else face punishment for contempt of court.").Bold().FontSize(10);

                    // Issuance date
                    col.Item().PaddingTop(14).Text($"    This {Model.DateIssued}.").FontSize(10);

                    // Punong Barangay signature
                    col.Item().PaddingTop(35).Row(row =>
                    {
                        row.RelativeItem();
                        row.ConstantItem(220).Column(sig =>
                        {
                            sig.Item().AlignCenter().Text(Model.PunongBarangay).Bold().FontSize(10);
                            sig.Item().Width(200).LineHorizontal(0.5f).LineColor(Colors.Black);
                            sig.Item().AlignCenter().Text("Punong Barangay/Lupon Chairman").FontSize(9);
                        });
                    });

                    // Receipt stamp
                    col.Item().PaddingTop(22).Column(rc =>
                    {
                        rc.Item().Text($"Time: {Model.TimeServed}").FontSize(9);
                        rc.Item().Text($"Date: {Model.DateServed}").FontSize(9);
                    });
                });
            });
        }
    }
}