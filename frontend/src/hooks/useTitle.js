import { useEffect } from 'react'
const useTitle = (title) => {
  useEffect(() => {
    document.title = `${title} | AI Productivity Tracker`
  }, [title])
}
export default useTitle
