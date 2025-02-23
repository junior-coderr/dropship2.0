import { v4 as uuidv4 } from "uuid";

// This is a mock implementation. Replace with your actual storage service (S3, Firebase, etc.)
export async function uploadFile(file) {
  try {
    const token = localStorage.getItem("auth_token");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Upload failed");
    }

    const data = await response.json();
    return {
      url: data.url,
      alt: data.alt,
      filename: data.filename,
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error(`Upload failed: ${error.message}`);
  }
}

export async function deleteFile(filename) {
  try {
    const token = localStorage.getItem("auth_token");
    const response = await fetch("/api/upload", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename }),
    });

    if (!response.ok) throw new Error("Delete failed");
    return true;
  } catch (error) {
    console.error("Delete error:", error);
    throw error;
  }
}
