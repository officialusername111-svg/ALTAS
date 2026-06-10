using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ALTAS.Models.DTO;
using ALTAS.Models;

namespace ALTAS.Reports
{
    public class BarangayClearanceDocument : IDocument
    {
        public ClearanceDTO Model { get; }
        private readonly string _logoPath;

        public BarangayClearanceDocument(ClearanceDTO model, string logoPath)
        {
            Model = model;
            _logoPath = logoPath;
        }

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Margin(50);
                page.Size(PageSizes.A4);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily(Fonts.Verdana));

                // --- WATERMARK SECTION ---
                // Background() ensures it stays behind the text
                // Update this section in your code to remove the invalid .Opacity() call
                page.Background().AlignCenter().AlignMiddle().Column(col =>
                {
                    string fadedLogoPath = _logoPath.Replace(".jpg", "_faded.png");

                    string imageToUse = null;

                    if (System.IO.File.Exists(fadedLogoPath))
                    {
                        imageToUse = fadedLogoPath;
                    }
                    else if (System.IO.File.Exists(_logoPath))
                    {
                        imageToUse = _logoPath;
                    }

                    if (imageToUse != null)
                    {
                        var fadedImage = new ReportBackGroundHelper().MakeTransparent(imageToUse, 0.25f);
                        col.Item().Width(350).Image(fadedImage);
                    }
                });

                // --- HEADER SECTION ---
                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        // Left Logo
                        if (System.IO.File.Exists(_logoPath))
                        {
                            row.ConstantItem(70).Image(_logoPath);
                        }
                        else
                        {
                            row.ConstantItem(70).Height(70).Placeholder();
                        }

                        row.RelativeItem().Column(headerCol =>
                        {
                            headerCol.Item().AlignCenter().Text("Republic of the Philippines").FontSize(8);
                            headerCol.Item().AlignCenter().Text("Province of South Cotabato").FontSize(8);
                            headerCol.Item().AlignCenter().Text("Municipality of Tupi").FontSize(8);
                            headerCol.Item().PaddingTop(5).AlignCenter().Text("BARANGAY POBLACION").Bold().FontSize(12);
                            headerCol.Item().AlignCenter().Text("OFFICE OF THE PUNONG BARANGAY").Bold().FontSize(10);
                        });

                        // Right Spacer to maintain center alignment
                        row.ConstantItem(70);
                    });

                    col.Item().PaddingTop(10).AlignCenter().Text("BARANGAY CLEARANCE").ExtraBold().FontSize(22);
                });

                // --- CONTENT SECTION ---
                page.Content().PaddingTop(30).Column(col =>
                {
                    // Date and Clearance Number
                    col.Item().Row(row => {
                        row.RelativeItem().Text(t => {
                            t.Span("Date: ");
                            t.Span(DateTime.Now.ToString("MMMM dd, yyyy")).Bold();
                        });
                        row.RelativeItem().AlignRight().Text(t => {
                            t.Span("Clearance Number: ");
                            t.Span(Model.ClearanceNumber).Bold();
                        });
                    });

                    // Personal Details Table
                    col.Item().PaddingTop(10).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        // Labels
                        table.Cell().Text("Family Name:").FontSize(8).FontColor(Colors.Grey.Darken2);
                        table.Cell().Text("First Name:").FontSize(8).FontColor(Colors.Grey.Darken2);
                        table.Cell().Text("Middle Name:").FontSize(8).FontColor(Colors.Grey.Darken2);

                        // Values
                        table.Cell().Text(Model.LastName).Bold().FontSize(10);
                        table.Cell().Text(Model.FirstName).Bold().FontSize(10);
                        table.Cell().Text(Model.MiddleName).Bold().FontSize(10);
                    });

                    // Secondary Details Row
                    col.Item().PaddingTop(10).Row(row => {
                        row.RelativeItem().Column(c => {
                            c.Item().Text("Date of Birth:").FontSize(8).FontColor(Colors.Grey.Darken2);
                            c.Item().Text(Model.DateOfBirth.ToString("MM/dd/yyyy")).Bold();
                        });
                        row.RelativeItem().Column(c => {
                            c.Item().Text("Place of Birth:").FontSize(8).FontColor(Colors.Grey.Darken2);
                            c.Item().Text(Model.PlaceOfBirth).Bold();
                        });
                        row.RelativeItem().Column(c => {
                            c.Item().Text("Age:").FontSize(8).FontColor(Colors.Grey.Darken2);
                            c.Item().Text(Model.Age).Bold();
                        });
                    });

                    // Address
                    col.Item().PaddingTop(10).Column(c => {
                        c.Item().Text("Address:").FontSize(8).FontColor(Colors.Grey.Darken2);
                        c.Item().Text(Model.Address).Bold();
                    });

                    // Legal Identity Info
                    col.Item().PaddingTop(15).Row(row => {
                        row.RelativeItem().Text(t => { t.Span("Sex: ").FontSize(8); t.Span(Model.Sex).Bold(); });
                        row.RelativeItem().Text(t => { t.Span("Civil Status: ").FontSize(8); t.Span(Model.CivilStatus).Bold(); });
                        row.RelativeItem().Text(t => { t.Span("Nationality: ").FontSize(8); t.Span(Model.Nationality).Bold(); });
                    });

                    // Body text
                    col.Item().PaddingTop(40).Text("TO WHOM IT MAY CONCERN:").Bold();
                    col.Item().PaddingTop(10).Text(text =>
                    {
                        text.Span("THIS IS TO CERTIFY THAT the above named-person whose signature and thumb marks appear below had the following findings:");
                    });

                    // Purpose Section
                    col.Item().PaddingVertical(20).AlignCenter().Border(1).Padding(10).Text(t => {
                        t.Span("PURPOSE: ").Bold();
                        t.Span(Model.Purpose.ToUpper()).Italic();
                    });

                    col.Item().Text("This BARANGAY CLEARANCE is being issued for whatever legal purpose/s stated above may served her/him best.");
                });

                // --- FOOTER SECTION (Signatures) ---
                page.Footer().PaddingBottom(20).Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        // Thumbmark/Signature area for resident
                        row.RelativeItem().Column(resCol => {
                            resCol.Item().Width(200).LineHorizontal(1).LineColor(Colors.Black);
                            resCol.Item().Text("Resident Signature").AlignCenter().FontSize(9);
                        });

                        // Punong Barangay Signature
                        row.RelativeItem().AlignRight().Column(sigCol =>
                        {
                            // Signature line (use real line, not underscores)
                            sigCol.Item().PaddingTop(20).AlignCenter().Text(Model.PunongBarangay).Bold();
                            sigCol.Item().Width(200).LineHorizontal(1).LineColor(Colors.Black);
                            sigCol.Item().AlignCenter().Text("Punong Barangay") .FontSize(10);
                        });
                    });
                });
            });
        }
    }
}