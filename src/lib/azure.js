import { BlobServiceClient } from "@azure/storage-blob";

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
const containerClient = blobServiceClient.getContainerClient(containerName);

export async function uploadToAzure(file, filename) {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    const options = {
      blobHTTPHeaders: {
        blobContentType: file.type,
        blobCacheControl: "public, max-age=31536000",
      },
    };

    const buffer = Buffer.from(await file.arrayBuffer());
    await blockBlobClient.upload(buffer, buffer.length, options);

    return {
      url: blockBlobClient.url,
      success: true,
    };
  } catch (error) {
    console.error("Azure upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function deleteFromAzure(filename) {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(filename);
    await blockBlobClient.delete();
    return { success: true };
  } catch (error) {
    console.error("Azure delete error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
