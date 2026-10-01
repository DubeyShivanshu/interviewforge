import { RouterProvider } from "react-router"
import { router } from "./app.routes.jsx"
import {InterviewProvider} from "./features/interview/interview.context.jsx"
import SphereBackground from "./components/SphereBackground.jsx";

function App() {

  return (
    <InterviewProvider>
      <SphereBackground />
      <RouterProvider router={router} />
    </InterviewProvider> 
  )
}

export default App
