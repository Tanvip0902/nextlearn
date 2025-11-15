import "server-only"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"

export const getIndividualCourse = async (slug: string) => {
  const course = await prisma.course.findUnique({
    where: {
      slug: slug
    },
    include: {
      chapter: {
        include: {
          lessons: {
            orderBy: {
              position: "asc"
            },
          },
        },
        orderBy:{
          position: "asc"
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    }
  })

  if(!course) return notFound()

  return course
}

export type IndividualCourseType = Awaited<ReturnType<typeof getIndividualCourse>>