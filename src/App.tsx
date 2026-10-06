import StudioLayout from './StudioLayout.tsx'
import { StudioProvider } from './StudioProvider.tsx'
import { StudioRouter } from './StudioRouter.tsx'

export default function App() {
  return <StudioProvider><StudioRouter><StudioLayout/></StudioRouter></StudioProvider>
}
