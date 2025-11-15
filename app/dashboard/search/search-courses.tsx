"use client"

import { useState } from "react"
import { EmptyState } from "@/components/general/EmptyState"
import { PublicCourseCard } from "@/app/(public)/_components/PublicCourseCard"
import { CourseProgressCard } from "../_components/CourseProgressCard"

export function SearchCourses({
  courses,
  enrolledCourses,
}: {
  courses: any[]
  enrolledCourses: any[]
}) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredEnrolled = enrolledCourses.filter((ec) =>
    ec.Course.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAvailable = courses.filter(
    (c) =>
      !enrolledCourses.some(({ Course }) => Course.id === c.id) &&
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      {/* 🔎 Search Bar */}
      <div className="my-4">
    <input
  type="text"
  placeholder="Search courses..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="w-full rounded-md border border-gray-600 bg-background p-2 text-foreground placeholder-gray-400 focus:outline-none"
/>

      </div>

      {/* Enrolled Courses */}
      <section>
        <h2 className="text-2xl font-bold mb-2">Enrolled Courses</h2>
        {filteredEnrolled.length === 0 ? (
          <EmptyState
            title="No Courses Found"
            description="No enrolled courses match your search."
            buttonText="Browse Courses"
            href="/courses"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEnrolled.map((course) => (
              <CourseProgressCard key={course.Course.id} data={course} />
            ))}
          </div>
        )}
      </section>

      {/* Available Courses */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold mb-2">Available Courses</h2>
        {filteredAvailable.length === 0 ? (
          <EmptyState
            title="No Courses Available"
            description="No available courses match your search."
            buttonText="Browse Courses"
            href="/courses"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAvailable.map((course) => (
              <PublicCourseCard key={course.id} data={course} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
