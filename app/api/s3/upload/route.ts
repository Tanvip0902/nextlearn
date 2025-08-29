import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3 } from "@/lib/S3Client";
import arcjet, { detectBot } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import  { fixedWindow } from "arcjet";
import { requireAdmin } from "@/app/data/admin/require-admin";

const aj=arcjet.withRule(
  detectBot({
    mode: "LIVE",
    allow:[]
  })
)
.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 2,
  })
)

export async function POST(request: Request) {

  const session = await requireAdmin();
  try {
    const decision = await aj.protect(request,{
      fingerprint: session?.user.id as string,
    });
     if(decision.isDenied()){
      return NextResponse.json(
        {
          error: "You are not allowed to perform this action"
        }, 
        {
          status: 429
        })
    }

    const { fileName, ContentType, size, isImage } = await request.json();

    // Generate a unique key for the file
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const key = `uploads/${timestamp}-${randomString}-${fileName}`;

    // Create the PutObject command
    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES!,
      Key: key,
      ContentType,
      // Add metadata if needed
      Metadata: {
        'original-name': fileName,
        'file-size': size.toString(),
        'is-image': isImage.toString(),
      },
    });

    // Generate presigned URL (expires in 10 minutes)
    const presignedUrl = await getSignedUrl(S3, command, {
       expiresIn: 600,
    });

    return NextResponse.json({
      presignedUrl,
      key,
      bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
    });

   } catch (error) {
     console.error('Error generating presigned URL:', error);
     return NextResponse.json(
       { error: 'Failed to generate presigned URL' },
       { status: 500 }
     );
   }
}