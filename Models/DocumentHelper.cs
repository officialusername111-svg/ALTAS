using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;


namespace ALTAS.Models
{
    public static class DocumentHelper
    {
        public static async Task<string> SaveUploadedFileAsync( IFormFile file, string CategoryName = "Documents", string oldFileLocation = null)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("No file uploaded.");

            string appRoot = Directory.GetCurrentDirectory();
            string documentsPath = Path.Combine(appRoot, "_documents");

            if (!Directory.Exists(documentsPath))
                Directory.CreateDirectory(documentsPath);

            // 🔥 DELETE OLD FOLDER (if provided)
            if (!string.IsNullOrEmpty(oldFileLocation))
            {
                try
                {
                    oldFileLocation = "/" + ("_" + oldFileLocation.Substring(1));
                    // Convert URL path → physical path
                    string oldPhysicalPath = Path.Combine(appRoot, oldFileLocation.TrimStart('/').Replace("/", "\\"));

                    // Get folder path
                    string oldFolderPath = Path.GetDirectoryName(oldPhysicalPath);

                    if (Directory.Exists(oldFolderPath))
                    {
                        Directory.Delete(oldFolderPath, true); // true = recursive delete
                    }
                }
                catch (Exception ex)
                {
                    // Log this, don’t crash the upload
                    Console.WriteLine("Error deleting old folder: " + ex.Message);
                }
            }

            // 🆕 Create new folder
            string timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            string folderName = CategoryName + "_" + timestamp;
            string folderPath = Path.Combine(documentsPath, folderName);

            Directory.CreateDirectory(folderPath);

            string destFilePath = Path.Combine(folderPath, file.FileName);

            using (var stream = new FileStream(destFilePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return URL path (for browser use)
            return $"/documents/{folderName}/{file.FileName}";
        }
    }
}
