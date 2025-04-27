import { Outlet } from 'react-router-dom'

import '../App.css'

function MainLayout() {
  return (
    //tambah main untuk imporve accessibility and SEO 
    //div untuk stylying
    <div>
        <main className='main'>
            <Outlet />
        </main>
    </div>
  )
}

export default MainLayout