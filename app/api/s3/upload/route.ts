import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "@/lib/S3Client";

export async function POST(req: Request) {
  try {
    const { fileName, contentType } = await req.json();

    const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES;
    if (!bucket) {
      throw new Error("NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES is missing in .env.local");
    }

    const key = `uploads/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      // Remove ContentType for Tigris compatibility - this is the main fix
      // ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(S3, command, { 
      expiresIn: 3600,
      // Add this for Tigris - prevents Content-Type header conflicts
      unhoistableHeaders: new Set(['content-type'])
    });

    // ✅ construct public URL (works for Tigris/S3-compatible storage)
    const publicUrl = `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${key}`;

    return NextResponse.json({ presignedUrl, key, publicUrl });
  } catch (err) {
    console.error("Presign error:", err);
    return NextResponse.json(
      { error: "Failed to create presigned URL" },
      { status: 500 }
    );
  }
}