import { PrismaCourseRepository, PrismaChapterRepository } from './prisma/course.repository'
import { PrismaQuizRepository } from './prisma/quiz.repository'
import { PrismaFlashcardRepository } from './prisma/flashcard.repository'
import { PrismaLabRepository } from './prisma/lab.repository'
import { PrismaTPRepository } from './prisma/tp.repository'
import { PrismaCheatRepository } from './prisma/cheat.repository'
import { PrismaCertificationRepository } from './prisma/certification.repository'
import { PrismaCommentRepository, PrismaResourceRepository } from './prisma/chapter-content.repository'
import { PrismaStatsRepository } from './prisma/stats.repository'
import { PrismaProjectRepository } from './prisma/project.repository'
import { PrismaUserRepository } from './prisma/user.repository'
import { PrismaSearchRepository } from './prisma/search.repository'
import { PrismaNotesRepository } from './prisma/notes.repository'
import { PrismaCommandLogRepository } from './prisma/command-log.repository'

export const courseRepo = new PrismaCourseRepository()
export const chapterRepo = new PrismaChapterRepository()
export const quizRepo = new PrismaQuizRepository()
export const flashcardRepo = new PrismaFlashcardRepository()
export const labRepo = new PrismaLabRepository()
export const tpRepo = new PrismaTPRepository()
export const cheatRepo = new PrismaCheatRepository()
export const certificationRepo = new PrismaCertificationRepository()
export const commentRepo = new PrismaCommentRepository()
export const resourceRepo = new PrismaResourceRepository()
export const statsRepo = new PrismaStatsRepository()
export const projectRepo = new PrismaProjectRepository()
export const userRepo = new PrismaUserRepository()
export const searchRepo = new PrismaSearchRepository()
export const notesRepo = new PrismaNotesRepository()
export const commandLogRepo = new PrismaCommandLogRepository()

export type {
  ICourseRepository,
  IChapterRepository,
  IQuizRepository,
  IFlashcardRepository,
  ILabRepository,
  ITPRepository,
  ICheatRepository,
  ICertificationRepository,
  ICommentRepository,
  IResourceRepository,
  IStatsRepository,
  IProjectRepository,
  IUserRepository,
  AppUser,
  ISearchRepository,
  INotesRepository,
  ICommandLogRepository,
} from './interfaces'
