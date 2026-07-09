import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import Home from '../pages/Home'
import Bookshelf from '../pages/Bookshelf'
import Comic from '../pages/Comic'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '', element: <Home /> },
      { path: 'bookshelf', element: <Bookshelf /> },
      { path: 'comic', element: <Comic /> },
    ]
  }
])

export default router;
