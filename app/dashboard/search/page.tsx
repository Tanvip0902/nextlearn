import { getAllCourses } from "@/app/data/course/get-all-courses"
import { getEnrolledCourses } from "@/app/data/user/get-enrolled-courses"
import { SearchCourses } from "./search-courses"


const SearchPage = async () => {
  const [courses, enrolledCourses] = await Promise.all([
    getAllCourses(),
    getEnrolledCourses(),
  ])

  return (
    <div className="p-4">
      <SearchCourses
        courses={courses}
        enrolledCourses={enrolledCourses}
      />
    </div>
  )
}

export default SearchPage
