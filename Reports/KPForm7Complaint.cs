using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ALTAS.Models.DTO;
using ALTAS.Models;

namespace ALTAS.Reports
{
    public class KPForm7Complaint : IDocument
    {
        public KPForm7ComplaintDTO Model { get; }
        private readonly string _logoPath;
        private readonly string _logoRightPath;

        public KPForm7Complaint(KPForm7ComplaintDTO model, string logoPath, string logoRightPath)
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
                    col.Item().AlignLeft().Text("KP Form No. 7").FontSize(9).Italic();

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
                            h.Item().PaddingTop(2).AlignCenter().Text("OFFICE OF THE LUPONG TAGAPAMAYAPA").FontSize(9);
                        });

                        if (System.IO.File.Exists(_logoRightPath))
                            row.ConstantItem(65).Image(_logoRightPath);
                        else
                            row.ConstantItem(65).Height(65).Placeholder();
                    });

                    // FIX 1: plain "COMPLAINT" — no spaced letters, no LetterSpacing
                    col.Item().PaddingTop(10).AlignCenter().Text("COMPLAINT").ExtraBold().FontSize(14);
                    col.Item().PaddingTop(4).LineHorizontal(0.5f).LineColor(Colors.Black);
                });

                // Content
                page.Content().PaddingTop(18).Column(col =>
                {
                    // Parties block — left side; case info — right side
                    col.Item().Row(row =>
                    {
                        // Left: all complainants then all respondents
                        row.RelativeItem().Column(c =>
                        {
                            // FIX 2: all complainants — bold name, normal address, with spacing between entries
                            RenderPartyBlock(c, Model.Complainants);
                            c.Item().Text("Complainant/s").FontSize(9);

                            c.Item().PaddingTop(10).Text("-Against-").Italic().FontSize(10);

                            // FIX 3: all respondents — same treatment
                            c.Item().PaddingTop(6);
                            RenderPartyBlock(c, Model.Respondents);
                            c.Item().Text("Respondent/s").FontSize(9);
                        });

                        // Right: case info
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

                    // Intro sentence
                    col.Item().PaddingTop(18).Text(t =>
                    {
                        t.DefaultTextStyle(s => s.FontSize(10));
                        t.Span("I/We hereby complain against above named respondent/s for violating my/our rights and interest in the following manner:");
                    });

                    // Complaint narrative — underlined italic, indented
                    col.Item().PaddingTop(10).PaddingLeft(20).Text(t =>
                    {
                        t.Span(Model.ComplaintNarrative ?? string.Empty).Underline().Italic().FontSize(10);
                    });

                    // Therefore clause
                    col.Item().PaddingTop(14).Text(t =>
                    {
                        t.DefaultTextStyle(s => s.FontSize(10));
                        t.Span("THEREFORE, I/WE pray that the following relief be granted to me/us in accordance with the law or equity.");
                    });

                    // Numbered reliefs
                    if (Model.Reliefs.Count > 0)
                    {
                        col.Item().PaddingTop(8).PaddingLeft(20).Column(rc =>
                        {
                            for (int i = 0; i < Model.Reliefs.Count; i++)
                            {
                                rc.Item().PaddingTop(4).Text(t =>
                                {
                                    t.Span($"{i + 1}.  ").FontSize(10);
                                    t.Span(Model.Reliefs[i]).Underline().Italic().FontSize(10);
                                });
                            }
                        });
                    }

                    // Date made
                    col.Item().PaddingTop(22).Text($"Made this {Model.DateMade}.").FontSize(10);

                    // Primary complainant signature
                    col.Item().PaddingTop(28).Row(row =>
                    {
                        row.RelativeItem();
                        row.ConstantItem(220).Column(sig =>
                        {
                            sig.Item().AlignCenter().Text(Model.Complainants.FirstOrDefault()?.FullName ?? string.Empty).Bold().FontSize(10);
                            sig.Item().Width(200).LineHorizontal(0.5f).LineColor(Colors.Black);
                            sig.Item().AlignCenter().Text("Complainant/s").FontSize(9);
                        });
                    });

                    // Received and filed
                    col.Item().PaddingTop(14).Text(t =>
                    {
                        t.DefaultTextStyle(s => s.FontSize(10));
                        t.Span("Received and filed this ");
                        t.Span(Model.DateMade);
                        t.Span(".");
                    });

                    // Punong Barangay signature
                    col.Item().PaddingTop(28).Row(row =>
                    {
                        row.RelativeItem();
                        row.ConstantItem(220).Column(sig =>
                        {
                            sig.Item().AlignCenter().Text(Model.PunongBarangay).Bold().FontSize(10);
                            sig.Item().Width(200).LineHorizontal(0.5f).LineColor(Colors.Black);
                            sig.Item().AlignCenter().Text("Punong Barangay/Lupon Chairperson").FontSize(9);
                        });
                    });

                    // Filing receipt
                    col.Item().PaddingTop(18).Column(rc =>
                    {
                        rc.Item().Text($"Time Filed: {Model.TimeFiled}").FontSize(9);
                        rc.Item().Text($"OR No.: {Model.ORNo}").FontSize(9);
                        rc.Item().Text($"Date Issued: {Model.DateIssued}").FontSize(9);
                        rc.Item().Text($"Amount: {Model.Amount}").FontSize(9);
                    });
                });
            });
        }

        // Renders each party as: bold name on its own line, address on the next line,
        // with a small gap between parties when there are multiple.
        private static void RenderPartyBlock(ColumnDescriptor col, List<KPPartyDTO> parties)
        {
            for (int i = 0; i < parties.Count; i++)
            {
                var p = parties[i];
                if (i > 0) col.Item().Height(4); // spacer between entries
                col.Item().Text(p.FullName ?? string.Empty).Bold().FontSize(10);
                if (!string.IsNullOrWhiteSpace(p.Address))
                    col.Item().Text(p.Address).FontSize(9);
            }
        }
    }
}