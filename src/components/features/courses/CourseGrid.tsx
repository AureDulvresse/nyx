import { CourseCard } from './CourseCard'
import type { Course, CourseProgress } from '@/domain'

export function CourseGrid({ courses, progresses }: { courses: Course[]; progresses?: CourseProgress[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} progress={progresses?.find((p) => p.courseId === course.id)} />
      ))}
    </div>
  )
}
