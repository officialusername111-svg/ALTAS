using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace ALTAS.Models
{
    public class ReportBackGroundHelper
    {
        public byte[] MakeTransparent(string path, float opacity)
        {
            using var image = Image.Load<Rgba32>(path);

            image.Mutate(x =>
            {
                x.Opacity(opacity); // 0.25f = 75% transparent
            });

            using var ms = new MemoryStream();
            image.SaveAsPng(ms);
            return ms.ToArray();
        }
    }
}
