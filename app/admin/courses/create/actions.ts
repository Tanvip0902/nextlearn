"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { courseSchema, CourseSchemaType } from "@/lib/zodschemas";
import { request } from "@arcjet/next";


const aj=arcjet
.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 2,
  })
)

export async function CreateCourse(data: CourseSchemaType): Promise<ApiResponse> {

    const session = await requireAdmin();
  try {
    const req = await request();                  // Reconstruye el objeto de la petición (ip del cliente, headers, cookies) 
    const decision = await aj.protect(req, {      // Se pasa a arcjet la petición que recibe la action para que pase por la protección contra bots y ataques de fuerza bruta.
      fingerprint: session?.user.id
    });

    if(decision.isDenied()){
      if(decision.reason.isRateLimit()){
        return {
          status: "error",
          message: "You have been blocked due to rate limiting"
        }
      }else{
        return {
          status: "error",
          message: "You are a bot! If this is a mistake, please contact support"
        }
      }
    }

    const validation = courseSchema.safeParse(data);

    if (!validation.success) {
      return {
        status: "error",
        message: "Invalid form data",
      };
    }

    await prisma.course.create({
      data: {
        ...validation.data,
        userId: session?.user.id  as string, // TODO: replace with logged-in user ID
      },
    });

    return {
      status: "success",
      message: "Course created successfully",
    };
  } catch (error) {
    console.error("CreateCourse error:", error);
    return {
      status: "error",
      message: "Something went wrong",
    };
  }
}
