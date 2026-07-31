import { notesRepo } from '@/repositories'
import { NotesPage } from '@/components/features/notes/NotesPage'

export default async function Page() {
  const [chapterNotes, comments] = await Promise.all([notesRepo.findAllChapterNotes(), notesRepo.findAllComments()])
  return <NotesPage chapterNotes={chapterNotes} comments={comments} />
}
