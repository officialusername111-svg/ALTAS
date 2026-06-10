using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ALTAS.Models.DTO;
using ALTAS.Models;

namespace ALTAS.Reports
{
    public class CertificateOfIndigency : IDocument
    {
        public CertificateOfIndigencyDTO Model { get; }
        private readonly string _logoPath;

        public CertificateOfIndigency(CertificateOfIndigencyDTO model, string logoPath)
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

                // 🔹 WATERMARK
                page.Background().AlignCenter().AlignMiddle().Column(col =>
                {
                    string fadedLogoPath = _logoPath.Replace(".jpg", "_faded.png");

                    string imageToUse = null;

                    if (System.IO.File.Exists(fadedLogoPath))
                        imageToUse = fadedLogoPath;
                    else if (System.IO.File.Exists(_logoPath))
                        imageToUse = _logoPath;

                    if (imageToUse != null)
                    {
                        var fadedImage = new ReportBackGroundHelper().MakeTransparent(imageToUse, 0.25f);
                        col.Item().Width(350).Image(fadedImage);
                    }
                });

                // 🔹 HEADER
                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.ConstantItem(70).Image(_logoPath);

                        row.RelativeItem().Column(headerCol =>
                        {
                            headerCol.Item().AlignCenter().Text("Republic of the Philippines").FontSize(8);
                            headerCol.Item().AlignCenter().Text("Province of South Cotabato").FontSize(8);
                            headerCol.Item().AlignCenter().Text("Municipality of Tupi").FontSize(8);

                            headerCol.Item().PaddingTop(5).AlignCenter().Text("BARANGAY POBLACION").Bold().FontSize(12);
                            headerCol.Item().AlignCenter().Text("OFFICE OF THE PUNONG BARANGAY").Bold().FontSize(10);
                        });

                        row.ConstantItem(70);
                    });

                    col.Item().PaddingTop(10)
                        .AlignCenter()
                        .Text("CERTIFICATE OF INDIGENCY")
                        .ExtraBold()
                        .FontSize(18);
                });

                // 🔹 CONTENT (THIS WAS MISSING PROPERLY)
                page.Content().Column(col =>
                {
                    col.Item().PaddingTop(40).Text("TO WHOM IT MAY CONCERN:").Bold();

                    col.Item().PaddingTop(10).Text(text =>
                    {
                        text.Span("          THIS IS TO CERTIFY that ");
                        text.Span(Model.FullName).Bold();
                        text.Span($", {Model.Age} years old, {Model.Sex}, {Model.CivilStatus}, {Model.Citizenship} citizen, is a bona fide resident of ");
                        text.Span(Model.PurokName).Bold();
                        text.Span(", Poblacion, Tupi, South Cotabato.");
                    });

                    col.Item().PaddingTop(10).Text(text =>
                    {
                        text.Span("          THIS FURTHER CERTIFIES that the afore named person family is an indigent and belong to below subsistence threshold level of this barangay (low income).");
                    });

                    col.Item().PaddingTop(20).Text(text =>
                    {
                        text.Span("          THIS CERTIFICATION is being issued upon the request of ");
                        text.Span(Model.Purpose).Bold();
                        text.Span(".");
                    });

                    col.Item().PaddingTop(20).Text($"          Issued this {Model.DateIssued} at the Barangay Hall, Poblacion, Tupi, South Cotabato.");

                    // 🔹 SIGNATURE

                });
                page.Footer().PaddingBottom(20).Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        // Punong Barangay Signature
                        row.RelativeItem().AlignRight().Column(sigCol =>
                        {
                            // Signature line (use real line, not underscores)
                            sigCol.Item().PaddingTop(20).AlignCenter().Text(Model.PunongBarangay).Bold();
                            sigCol.Item().Width(200).LineHorizontal(1).LineColor(Colors.Black);
                            sigCol.Item().AlignCenter().Text("Punong Barangay").FontSize(10);
                        });
                    });

                    col.Item().Row(row =>
                    {
                        //footnote
                        row.RelativeItem().AlignLeft().PaddingTop(30).Column(noteCol =>
                        {
                            noteCol.Item().AlignCenter().Text("\"Note: A mark, erasures, or alteration of any entry invalidates this certification.\"").FontSize(8);
                        });
                    });

                });
            });
        }
    }
}